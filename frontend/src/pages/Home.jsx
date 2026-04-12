// src/pages/Home.jsx
//
// Page unique partagée par le visiteur ET le consommateur.
// Les fonctionnalités consommateur (favoris, historique, commentaires,
// profil, chatbot) sont montées conditionnellement selon user?.role.
//
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composants communs
import Navbar from '../components/Home/Navbar';
import HeroSection from '../components/Home/HeroSection';
import ScannerSection from '../components/Home/ScannerSection';
import ProductsSection from '../components/Home/ProductsSection';
import Footer from '../components/Home/Footer';
import ResultatAnalyse from '../components/Shared/ResultatAnalyse';

// Composants consommateur uniquement
import Chatbot from '../components/Home/Chatbot';

// Hooks
import useFavorites from '../hooks/useFavorites';
import useHistory from '../hooks/useHistory';
import useComments from '../hooks/useComments';

const Home = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const isConsommateur = user?.role === 'consommateur';

  // ── Modals ne sont plus utilisés ici (transformés en pages) ───────

  // ── Produits ───────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanError, setScanError] = useState(false);

  // States pour la recherche Hero
  const [searchMode, setSearchMode] = useState('produit');
  const [ingredientResult, setIngredientResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ── Hooks consommateur ─────────────────────────────────────────────────────
  // Les hooks sont toujours appelés (règle des hooks React),
  // mais ils retournent des valeurs vides si le rôle n'est pas consommateur.
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(
    user?.id,
    user?.role
  );
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useHistory(
    isConsommateur ? user?.id : null
  );
  const {
    comments,
    getProductComments,
    getAverageRating,
    addComment,
    editComment,
    deleteComment,
  } = useComments();

  // ── Redirection admin ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === 'administrateur') {
      navigate('/dashboard/AdminDashboard', { replace: true });
    }
  }, [user, navigate]);

  // ── Chargement produits ────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Initialiser avec le cache instantanément si disponible
    const cached = localStorage.getItem('cached_produits');
    if (cached) {
      const parsed = JSON.parse(cached);
      setAllProducts(parsed);
      // Ne mettre à jour l'affichage que s'il n'y a pas de recherche en cours
      if (!searchQuery.trim()) {
        setDisplayProducts(parsed);
      }
    }

    // 2. Toujours rafraîchir en arrière-plan
    fetch('http://localhost:5000/api/produits?status=approved')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        localStorage.setItem('cached_produits', JSON.stringify(data));
        // Met à jour la liste affichée seulement si aucune recherche n'est tapée
        setSearchQuery((currentQuery) => {
           if (!currentQuery.trim()) {
               setDisplayProducts(data);
           }
           return currentQuery;
        });
      })
      .catch(() => console.log('API indisponible'));
  }, []);

  // Réinitialise displayProducts quand la recherche est effacée
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayProducts(allProducts);
      setIngredientResult(null);
    }
  }, [searchQuery, allProducts]);

  // ── Recherche ──────────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      setDisplayProducts(allProducts);
      setIngredientResult(null);
      return;
    }

    setIsAnalyzing(true);
    setIngredientResult(null);

    if (searchMode === 'produit') {
      try {
        const response = await fetch(`http://localhost:5000/api/produits/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Erreur serveur OCR/NLP');
        const results = await response.json();
        
        setDisplayProducts(results);

        if (isConsommateur && results.length > 0) {
          addToHistory(query);
        }
      } catch (err) {
        console.error("Erreur avec la recherche NLP:", err);
        // Fallback local
        const lowerQuery = query.toLowerCase();
        const results = allProducts.filter(
          (p) =>
            p.nom?.toLowerCase().includes(lowerQuery) ||
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            (p.ingredients && p.ingredients.some(ing => ing.nom?.toLowerCase().includes(lowerQuery)))
        );
        setDisplayProducts(results);

        if (isConsommateur && results.length > 0) {
          addToHistory(query);
        }
      }
    } else {
      // Mode Ingrédient
      try {
        const ingList = query.split(',').map(s => s.trim()).filter(s => s);
        const nbIngs = ingList.length;
        const eNumbers = ingList.filter(i => i.match(/(E\d{3}|Conservateur|Émulsifiant)/i)).length;
        
        const estimatedNova = (nbIngs > 5 || eNumbers > 0) ? 4 : (nbIngs > 2 ? 3 : 1);
        const estimatedNutri = (nbIngs * 3 + eNumbers * 5);

        const aiResponse = await fetch('http://localhost:5000/api/analyses/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nb_ingredients: nbIngs,
                ingredients_text: query,
                contains_preservatives: ingList.some(i => i.toLowerCase().includes('conserv')) ? 1 : 0,
                contains_artificial_colors: ingList.some(i => i.toLowerCase().includes('coloran')) ? 1 : 0,
                contains_flavouring: ingList.some(i => i.toLowerCase().includes('arôm')) ? 1 : 0,
                nova_group: estimatedNova,
                nutriscore_num: estimatedNutri,
                nb_e_numbers: eNumbers,
                ingredients_length: nbIngs
            })
        });
        const data = await aiResponse.json();

        const customProduct = {
            nom: "Analyse des ingrédients",
            description: `Ingrédients analysés : ${query}`,
            ingredients: ingList.map(nom => ({ nom, estBio: false })),
            ai_predictions: data.predictions || {},
            scoreBio: data.predictions?.bioscore || 50,
            image: null, // L'image fallback s'affichera
            origine: "Analyse personnalisée",
            marque: "BioScan AI"
        };

        setIngredientResult(customProduct);

        if (isConsommateur) {
            addToHistory(query);
        }
      } catch (err) {
        console.error("Erreur avec l'analyse d'ingrédients:", err);
      }
    }
    
    setIsAnalyzing(false);
  };

  // ── Recherche par Scan ──────────────────────────────────────────────────────
  const handleBarcodeScan = async () => {
    setScanError(false);
    const query = barcode.trim();
    if (!query) return;

    const lowerQuery = query.toLowerCase();
    
    // Recherche par code-barres uniquement (exclusivement pour le scan)
    const found = allProducts.find((p) => {
      if (p.code_barre === query || p.codeBarres === query) return true;
      return false;
    });

    if (found) {
      try {
        // Calcul intelligent de variables pour donner des prédictions IA réalistes selon la base locale
        const nbIngs = found.ingredients ? found.ingredients.length : 0;
        const eNumbers = found.ingredients ? found.ingredients.filter(i => i.nom && i.nom.match(/(E\d{3}|Conservateur|Émulsifiant)/i)).length : 0;
        // Nova estimé (1=brut, 4=ultra transformé) basé sur le nb d'additifs et d'ingrédients
        const estimatedNova = (nbIngs > 5 || eNumbers > 0) ? 4 : (nbIngs > 2 ? 3 : 1);
        // Nutriscore (Nutriscore Nummers: de -15 très sain à +40 très mauvais) extrapolé via scoreBio
        const estimatedNutri = found.scoreBio ? (100 - found.scoreBio) / 2 - 10 : (nbIngs * 3 + eNumbers * 5);

        const response = await fetch('http://localhost:5000/api/analyses/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             nb_ingredients: nbIngs,
             ingredients_text: found.description || found.nom || '',
             contains_preservatives: found.ingredients?.some(i => i.nom && i.nom.toLowerCase().includes('conserv')) ? 1 : 0,
             contains_artificial_colors: found.ingredients?.some(i => i.nom && i.nom.toLowerCase().includes('coloran')) ? 1 : 0,
             contains_flavouring: found.ingredients?.some(i => i.nom && i.nom.toLowerCase().includes('arôm')) ? 1 : 0,
             nova_group: found.nova_group || estimatedNova,
             nutriscore_num: found.nutriscore || estimatedNutri,
             nb_e_numbers: found.nb_e_numbers || eNumbers,
             ingredients_length: nbIngs
          })
        });
        
        const data = await response.json();
        
        const productWithAI = {
            ...found,
            ai_predictions: data.predictions || {}
        };
        
        setScannedProduct(productWithAI);
        
        if (isConsommateur) {
          addToHistory(query);
        }
      } catch (err) {
        console.error("Erreur lors de l'appel à l'IA :", err);
        setScannedProduct(found); // Fallback sans IA
      }
    } else {
      setScannedProduct(null);
      setScanError(true);
    }
  };

  // ── Commentaires ───────────────────────────────────────────────────────────
  const handleOpenComments = (product) => {
    // Redirige vers la nouvelle page en passant le composant via state
    navigate('/commentaires', { state: { product } });
  };

  // ── Déconnexion ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <Navbar
        user={user}
        favoritesCount={isConsommateur ? favorites.length : 0}
        onFavoritesClick={() => navigate('/favoris')}
        onHistoryClick={() => navigate('/historique')}
        onProfileClick={() => navigate('/profil')}
        onLogout={handleLogout}
      />

      {/* ── Sections communes ──────────────────────────────────────────── */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        displayProducts={displayProducts}
        handleSearch={handleSearch}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
      />



      <ScannerSection
        barcode={barcode}
        setBarcode={(val) => {
          setBarcode(val);
          setScanError(false);
          if (val === '') setScannedProduct(null);
        }}
        handleBarcodeScan={handleBarcodeScan}
        scannedProduct={scannedProduct}
        scanError={scanError}
      />

      {isAnalyzing && (
         <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '1.2rem', color: '#64748b', backgroundColor: '#f8fafc' }}>
            <span style={{ display: 'inline-block', animation: 'spin 2s linear infinite', marginRight: '0.5rem' }}>⏳</span>
            Analyse IA en cours...
         </div>
      )}

      {!isAnalyzing && searchMode === 'ingredient' && ingredientResult ? (
        <section id="products-section" style={{ backgroundColor: '#f8fafc', padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '1000px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem', textAlign: 'center' }}>
                    Résultat de l'analyse IA
                </h2>
                <ResultatAnalyse product={ingredientResult} />
            </div>
        </section>
      ) : (
        <ProductsSection
            displayProducts={displayProducts}
            user={user}
            handleAddFavorite={addFavorite}
            handleOpenComments={handleOpenComments}
            isFavorite={isFavorite}
            getAverageRating={getAverageRating}
            getProductComments={getProductComments}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
        />
      )}

      {/* ── Chatbot — consommateur uniquement ─────────────────────────── */}
      {isConsommateur && <Chatbot user={user} addToHistory={addToHistory} />}

      <Footer />
    </div>
  );
};

export default Home;