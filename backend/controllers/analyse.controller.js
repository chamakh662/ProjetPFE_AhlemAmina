const Analyse = require('../models/analyse.model');
const { spawn } = require('child_process');
const path = require('path');
const { analyzeIngredientsWithGemini } = require('../services/llmAnalyzer');

// --- Logique ML Python (inchangée) ---
function getMLPredictions(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'predictor.py');
    const pythonBin = process.env.PYTHON_BIN || 'python';
    const py = spawn(pythonBin, [scriptPath]);
    let stdout = '';
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
    py.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    py.on('close', (code) => {
      try {
        const jsonStart = stdout.indexOf('{');
        const clean = jsonStart !== -1 ? stdout.slice(jsonStart) : stdout;
        const result = JSON.parse(clean.trim());
        resolve(result.predictions || {});
      } catch (e) { reject(new Error('Invalid Python response')); }
    });
    py.on('error', (err) => reject(err));
  });
}

// --- Point d'entrée principal (LLM + ML) ---
exports.predictIngredientsWithLLM = async (req, res) => {
  try {
    const { ingredients_text } = req.body;
    if (!ingredients_text) return res.status(400).json({ message: 'Texte requis' });

    console.log('🔄 Démarrage de l\'analyse combinée...');
    
    // 1. Appel Gemini
    console.log('🤖 Analyse Gemini en cours...');
    const llmAnalysis = await analyzeIngredientsWithGemini(ingredients_text);

    // 2. Appel ML Python (Optionnel)
    let mlPredictions = {};
    try {
      mlPredictions = await getMLPredictions(req.body);
    } catch (e) { console.warn('⚠️ ML ignoré'); }

    // Fusion: on s'assure d'exposer les attributs globaux (NOVA, risques) du LLM à la racine si l'API ML est indisponible
    return res.status(200).json({
      success: true,
      predictions: {
        nova_group: llmAnalysis.nova_group,
        cardio_risk: llmAnalysis.cardio_risk,
        diabetes_risk: llmAnalysis.diabetes_risk,
        additive_exposure: llmAnalysis.additive_exposure,
        ultra_transforme: llmAnalysis.ultra_transforme,
        ...mlPredictions, // Le ML peut overrider s'il réussit
        llm: llmAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur analyse', detail: error.message });
  }
};

// --- Analyse unitaire (pour ton bouton spécifique) ---
exports.analyzeSingleIngredientLLM = async (req, res) => {
  try {
    const { nom } = req.body;
    const result = await analyzeIngredientsWithGemini(nom);
    res.status(200).json({ success: true, analysis: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, detail: error.message });
  }
};

// --- CRUD Opérations ---
exports.createAnalyse = async (req, res) => {
    try {
        const analyse = new Analyse({
            id_analyse: req.body.id_analyse,
            produit: req.body.produit
        });
        const savedAnalyse = await analyse.save();
        res.status(201).json(savedAnalyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllAnalyses = async (req, res) => {
    try {
        const analyses = await Analyse.find().populate('produit');
        res.status(200).json(analyses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAnalyseById = async (req, res) => {
    try {
        const analyse = await Analyse.findById(req.params.id).populate('produit');
        if (!analyse) return res.status(404).json({ message: "Analyse non trouvée" });
        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAnalyse = async (req, res) => {
    try {
        const analyse = await Analyse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!analyse) return res.status(404).json({ message: "Analyse non trouvée" });
        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAnalyse = async (req, res) => {
    try {
        const analyse = await Analyse.findByIdAndDelete(req.params.id);
        if (!analyse) return res.status(404).json({ message: "Analyse non trouvée" });
        res.status(200).json({ message: "Analyse supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PREDICT product using AI models
exports.predictProduct = async (req, res) => {
    try {
        const productData = req.body;
        const scriptPath = path.join(__dirname, '..', 'predictor.py');
        const pythonExecutable = process.env.PYTHON_BIN || 'python';
        const pythonProcess = spawn(pythonExecutable, [scriptPath]);
        
        let predictedData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data) => { predictedData += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0 || errorData) {
                console.error("Python Error:", errorData);
                if(!predictedData) return res.status(500).json({ message: "Error during prediction", error: errorData });
            }
            try {
                const result = JSON.parse(predictedData);
                res.status(200).json(result);
            } catch (err) {
                const jsonStart = predictedData.indexOf('{');
                if (jsonStart !== -1) {
                    try {
                        const jsonStr = predictedData.substring(jsonStart);
                        const result = JSON.parse(jsonStr);
                        return res.status(200).json(result);
                    } catch (e2) {}
                }
                res.status(500).json({ message: "Failed to parse prediction output", details: predictedData });
            }
        });
        
        pythonProcess.stdin.write(JSON.stringify(productData));
        pythonProcess.stdin.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};