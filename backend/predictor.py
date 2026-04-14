import sys
import json
import os
import urllib.parse
try:
    import joblib
    import pandas as pd
    
    # Patch for scikit-learn > 1.3 loading older models
    import sklearn.ensemble
    try:
        import sklearn.ensemble._gb_losses
    except ImportError:
        import types
        dummy_gb_losses = types.ModuleType("sklearn.ensemble._gb_losses")
        
        class DummyLoss: pass
        dummy_gb_losses.BinomialDeviance = DummyLoss
        dummy_gb_losses.MultinomialDeviance = DummyLoss
        dummy_gb_losses.LossFunction = DummyLoss
        dummy_gb_losses.LeastSquaresError = DummyLoss
        dummy_gb_losses.LeastAbsoluteError = DummyLoss
        dummy_gb_losses.HuberLossFunction = DummyLoss
        dummy_gb_losses.QuantileLossFunction = DummyLoss
        
        sys.modules["sklearn.ensemble._gb_losses"] = dummy_gb_losses
        sklearn.ensemble._gb_losses = dummy_gb_losses

except ImportError as e:
    print(json.dumps({"error": f"Missing library: {str(e)}"}))
    sys.exit(1)

def get_mock_prediction(key, features=None):
    if features is None:
        features = {}
        
    nova = float(features.get('nova_group', 1) or 1)
    nutri = float(features.get('nutriscore_num', 0) or 0)
    e_nums = float(features.get('nb_e_numbers', 0) or 0)
    
    if key == 'bioscore':
        return int(max(0, min(100, 100 - (nova * 10) - (e_nums * 5) - (nutri * 0.5))))
        
    if key == 'cardio_risk':
        risk_score = nutri + (nova * 2) + (e_nums * 1.5)
        if risk_score >= 12: return 'High'
        if risk_score >= 6: return 'Medium'
        return 'Low'
        
    if key == 'cardio_risk_proba':
        risk_score = nutri + (nova * 2) + (e_nums * 1.5)
        proba = min(98.5, max(12.5, risk_score * 4.2 + 10))
        return proba
        
    if key == 'diabetes_risk':
        sugar_indicator = nutri * 0.7 + (nova * 2.5) 
        if sugar_indicator >= 15: return 'High'
        if sugar_indicator >= 8: return 'Medium'
        return 'Low'
        
    if key == 'diabetes_risk_proba':
        sugar_indicator = nutri * 0.7 + (nova * 2.5)
        proba = min(99.0, max(8.0, sugar_indicator * 4.5 + 12))
        return proba

    # --- MODIFIÉ : additive_exposure retourne maintenant un % de probabilité ---
    if key == 'additive_exposure':
        # Conversion du nb d'additifs en score de probabilité d'exposition élevée
        # 0 additif → ~5%, 2 → ~45%, 4 → ~80%, 6+ → ~95%
        proba = min(97.0, max(5.0, e_nums * 18.0 + 5.0))
        return round(proba, 1)

    # --- MODIFIÉ : ultra_transforme retourne maintenant un % de probabilité ---
    if key == 'ultra_transforme':
        # NOVA 4 → forte probabilité, NOVA 1 → faible probabilité
        nova_map = {1: 8.0, 2: 25.0, 3: 58.0, 4: 92.0}
        proba = nova_map.get(int(nova), 50.0)
        # Affiner avec le nombre d'additifs
        proba = min(97.0, max(3.0, proba + (e_nums * 1.5)))
        return round(proba, 1)
        
    if key == 'additifs_suspects':
        return int(min(e_nums, 5))
        
    return 'Unknown'

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        data = json.loads(input_data)
        
        features = {
            'nb_ingredients': float(data.get('nb_ingredients', 0) or 0),
            'contains_preservatives': float(data.get('contains_preservatives', 0) or 0),
            'contains_artificial_colors': float(data.get('contains_artificial_colors', 0) or 0),
            'contains_flavouring': float(data.get('contains_flavouring', 0) or 0),
            'nova_group': float(data.get('nova_group', 1) or 1),
            'nutriscore_num': float(data.get('nutriscore_num', 0) or 0),
            'nb_e_numbers': float(data.get('nb_e_numbers', 0) or 0),
            'ingredients_length': float(data.get('ingredients_length', 0) or 0),
            'ingredients_text': str(data.get('ingredients_text', ''))
        }
        
        df = pd.DataFrame([features])
        
        models_dir = os.path.join(os.path.dirname(__file__), 'modelsIA')
        
        predictions = {}
        
        model_files = {
            'bioscore': 'bioscore_model.joblib',
            'cardio_risk': 'cardio_risk_model.joblib',
            'diabetes_risk': 'diabetes_risk_model.joblib',
            'additive_exposure': 'additive_exposure_model.joblib',
            'ultra_transforme': 'ultra_transforme_model.joblib',
            'additifs_suspects': 'additifs_suspects_model.joblib'
        }
        
        for key, filename in model_files.items():
            filepath = os.path.join(models_dir, filename)
            if os.path.exists(filepath):
                try:
                    model = joblib.load(filepath)
                    pred = model.predict(df)[0]
                    if hasattr(pred, 'item'):
                        pred = pred.item()

                    # --- MODIFIÉ : pour additive_exposure et ultra_transforme,
                    #     on utilise predict_proba si disponible, sinon mock ---
                    if key == 'additive_exposure':
                        if hasattr(model, 'predict_proba'):
                            proba_array = model.predict_proba(df)[0]
                            # Probabilité de la classe "High" (dernière classe)
                            predictions[key] = round(float(max(proba_array)) * 100, 1)
                        else:
                            predictions[key] = get_mock_prediction(key, features)

                    elif key == 'ultra_transforme':
                        if hasattr(model, 'predict_proba'):
                            proba_array = model.predict_proba(df)[0]
                            # Probabilité de la classe positive (ultra-transformé = 1)
                            classes = list(model.classes_)
                            pos_idx = classes.index(1) if 1 in classes else -1
                            proba = proba_array[pos_idx] if pos_idx >= 0 else max(proba_array)
                            predictions[key] = round(float(proba) * 100, 1)
                        else:
                            predictions[key] = get_mock_prediction(key, features)

                    else:
                        predictions[key] = pred
                        # Probas pour risques cardio/diabète
                        if key in ['cardio_risk', 'diabetes_risk'] and hasattr(model, 'predict_proba'):
                            proba_array = model.predict_proba(df)[0]
                            predictions[f'{key}_proba'] = round(float(max(proba_array)) * 100, 1)

                except Exception as e:
                    sys.stderr.write(f"Exception for {filename}: {str(e)}\n")
                    predictions[key] = get_mock_prediction(key, features)
                    if key in ['cardio_risk', 'diabetes_risk']:
                        predictions[f'{key}_proba'] = round(get_mock_prediction(f'{key}_proba', features), 1)
            else:
                predictions[key] = get_mock_prediction(key, features)
                if key in ['cardio_risk', 'diabetes_risk']:
                    predictions[f'{key}_proba'] = round(get_mock_prediction(f'{key}_proba', features), 1)

        try:
            predictions['nova_group'] = int(max(1, min(4, features.get('nova_group', 1))))
        except Exception:
            predictions['nova_group'] = 1
                
        print(json.dumps({"success": True, "predictions": predictions}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()