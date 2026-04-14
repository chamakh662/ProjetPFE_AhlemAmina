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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSearchProduct, setSelectedSearchProduct] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ── Hooks consommateur ─────────────────────────────────────────────────────
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
    const cached = localStorage.getItem('cached_produits');
    if (cached) {
      const parsed = JSON.parse(cached);
      setAllProducts(parsed);
      if (!searchQuery.trim()) {
        setDisplayProducts(parsed);
      }
    }

    fetch('http://localhost:5000/api/produits?status=approved')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          localStorage.setItem('cached_produits', JSON.stringify(data));
          setSearchQuery((currentQuery) => {
            if (!currentQuery.trim()) {
              setDisplayProducts(data);
            }
            return currentQuery;
          });
        } else {
          console.error("L'API n'a pas retourné un tableau :", data);
        }
      })
      .catch(() => console.log('API indisponible'));
  }, []);

  // Réinitialise displayProducts quand la recherche est effacée
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayProducts(allProducts);
      setIngredientResult(null);
      setSelectedProduct(null);
      setSelectedSearchProduct(null);
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
        const response = await fetch(
          `http://localhost:5000/api/produits/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Erreur serveur OCR/NLP');
        const results = await response.json();

        if (Array.isArray(results)) {
          setDisplayProducts(results);
          if (isConsommateur && results.length > 0) {
            addToHistory(query);
          }
        } else {
          setDisplayProducts([]);
        }
      } catch (err) {
        console.error('Erreur avec la recherche NLP:', err);
        const lowerQuery = query.toLowerCase();
        const results = allProducts.filter(
          (p) =>
            p.nom?.toLowerCase().includes(lowerQuery) ||
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            (p.ingredients &&
              p.ingredients.some((ing) =>
                ing.nom?.toLowerCase().includes(lowerQuery)
              ))
        );
        setDisplayProducts(results);
        if (isConsommateur && results.length > 0) {
          addToHistory(query);
        }
      }
    } else {
      // Mode Ingrédient
      try {
        const ingList = query
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        const nbIngs = ingList.length;
        const eNumbers = ingList.filter((i) =>
          i.match(/(E\d{3}|Conservateur|Émulsifiant)/i)
        ).length;

        const estimatedNova =
          nbIngs > 5 || eNumbers > 0 ? 4 : nbIngs > 2 ? 3 : 1;
        const estimatedNutri = nbIngs * 3 + eNumbers * 5;

        const aiResponse = await fetch(
          'http://localhost:5000/api/analyses/predict-ingredients-llm',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nb_ingredients: nbIngs,
              ingredients_text: query,
              contains_preservatives: ingList.some((i) =>
                i.toLowerCase().includes('conserv')
              )
                ? 1
                : 0,
              contains_artificial_colors: ingList.some((i) =>
                i.toLowerCase().includes('coloran')
              )
                ? 1
                : 0,
              contains_flavouring: ingList.some((i) =>
                i.toLowerCase().includes('arôm')
              )
                ? 1
                : 0,
              nova_group: estimatedNova,
              nutriscore_num: estimatedNutri,
              nb_e_numbers: eNumbers,
              ingredients_length: nbIngs,
            }),
          }
        );
        const data = await aiResponse.json();
        console.log('🔍 API Response:', JSON.stringify(data, null, 2));

        // L'API retourne { success: true, predictions: { llm: { ingredients, resume_global, qualite_globale }, ...mlFields } }
        const predictions = data.predictions || {};
        const llmData = predictions.llm || null;

        console.log('🧪 LLM data:', llmData);
        console.log('🧪 LLM ingredients:', llmData?.ingredients);

        const customProduct = {
          nom: "Analyse des ingrédients",
          description: `Ingrédients analysés : ${query}`,
          ingredients: ingList.map((nom) => ({ nom, estBio: false })),
          ai_predictions: {
            ...predictions,
            llm: llmData,
            nova_group: predictions.nova_group || estimatedNova,
            bioscore: predictions.bioscore || 50,
          },
          scoreBio: predictions.bioscore || 50,
          nova_group: predictions.nova_group || estimatedNova,
          image: null,
          origine: 'Analyse personnalisée',
          marque: 'BioScan AI',
        };

        console.log('📦 customProduct:', JSON.stringify(customProduct, null, 2));

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

  const buildAnalysisPayload = (produit) => {
    const ingredients = produit?.ingredients || [];
    const ingredientsText =
      produit?.description || produit?.nom || produit?.name || '';
    const ingredientNames = ingredients.map((ing) =>
      (ing.nom || ing.name || '').toLowerCase()
    );
    const eNumbers = ingredientNames.filter((nom) =>
      nom.match(/(E\d{3}|conservateur|émulsifiant)/i)
    ).length;
    const containsPreservatives = ingredientNames.some((nom) =>
      nom.includes('conserv')
    );
    const containsArtificialColors = ingredientNames.some(
      (nom) => nom.includes('coloran') || nom.includes('colorant')
    );
    const containsFlavouring = ingredientNames.some(
      (nom) =>
        nom.includes('arôm') ||
        nom.includes('arome') ||
        nom.includes('arôme')
    );
    const nbIngredients = ingredients.length;
    const estimatedNova =
      produit?.nova_group ||
      produit?.nova ||
      (nbIngredients > 5 || eNumbers > 0
        ? 4
        : nbIngredients > 2
          ? 3
          : 1);
    const estimatedNutri =
      produit?.nutriscore ||
      produit?.nutri_score ||
      produit?.nutriscore_num ||
      nbIngredients * 3 + eNumbers * 5;

    return {
      nb_ingredients: nbIngredients,
      ingredients_text: ingredientsText,
      contains_preservatives: containsPreservatives ? 1 : 0,
      contains_artificial_colors: containsArtificialColors ? 1 : 0,
      contains_flavouring: containsFlavouring ? 1 : 0,
      nova_group: estimatedNova,
      nutriscore_num: estimatedNutri,
      nb_e_numbers: produit?.nb_e_numbers || eNumbers,
      ingredients_length: nbIngredients,
    };
  };

  const fetchAIForProduct = async (produit) => {
    if (!produit) return produit;
    if (
      produit.ai_predictions &&
      Object.keys(produit.ai_predictions).length > 0
    ) {
      return produit;
    }

    try {
      // Use LLM-enriched analysis endpoint for complete ingredient analysis
      const response = await fetch(
        'http://localhost:5000/api/analyses/predict-ingredients-llm',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildAnalysisPayload(produit)),
        }
      );
      const data = await response.json();
      return {
        ...produit,
        ai_predictions: data.predictions || data || {},
      };
    } catch (err) {
      console.error(
        'Erreur lors de la récupération IA pour le produit :',
        produit?.nom || produit?.name,
        err
      );
      return produit;
    }
  };

  const handleSelectProduct = async (produit) => {
    setIsAnalyzing(true);
    const enriched = await fetchAIForProduct(produit);
    setSelectedProduct(enriched);
    setIsAnalyzing(false);
  };

  const handleSelectSearchProduct = async (produit) => {
    setIsAnalyzing(true);
    const enriched = await fetchAIForProduct(produit);
    setSelectedSearchProduct(enriched);
    setIsAnalyzing(false);
  };

  // ── Reset produit scanné (bouton retour dans ScannerSection) ───────────────
  const handleResetScannedProduct = () => {
    setScannedProduct(null);
    setBarcode('');
    setScanError(false);
  };

  // ── Recherche par Scan ─────────────────────────────────────────────────────
  const handleBarcodeScan = async () => {
    setScanError(false);
    const query = barcode.trim();
    if (!query) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:5000/api/produits/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_barre: query }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setScanError(true);
          setScannedProduct(null);
          return;
        }
        throw new Error(`Échec du scan : ${response.status}`);
      }

      const product = await response.json();
      setScannedProduct(product);

      setAllProducts((prevProducts) => {
        const existingIndex = prevProducts.findIndex(
          (p) =>
            (p._id && product._id && p._id === product._id) ||
            p.code_barre === product.code_barre ||
            p.codeBarres === product.codeBarres
        );

        if (existingIndex !== -1) {
          const copy = [...prevProducts];
          copy[existingIndex] = product;
          return copy;
        }

        return prevProducts;
      });

      if (isConsommateur) {
        addToHistory(query);
      }
    } catch (err) {
      console.error("Erreur lors de l'appel de scan produit : ", err);
      setScanError(true);
      setScannedProduct(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Commentaires ───────────────────────────────────────────────────────────
  const handleOpenComments = (product) => {
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
        onResetProduct={handleResetScannedProduct}
      />

      {isAnalyzing && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 0',
            fontSize: '1.2rem',
            color: '#64748b',
            backgroundColor: '#f8fafc',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: 'spin 2s linear infinite',
              marginRight: '0.5rem',
            }}
          >
            ⏳
          </span>
          Analyse IA en cours...
        </div>
      )}

      {!isAnalyzing && selectedProduct ? (
        <section
          id="products-section"
          style={{
            backgroundColor: '#f8fafc',
            padding: '4rem 1.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#0f172a',
                }}
              >
                Résultat de l'analyse IA
              </h2>
              <button
                style={{
                  padding: '0.75rem 1.2rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  color: '#334155',
                }}
                onClick={() => setSelectedProduct(null)}
              >
                Retour au scan
              </button>
            </div>
            <ResultatAnalyse product={selectedProduct} />
          </div>
        </section>
      ) : !isAnalyzing && selectedSearchProduct ? (
        <section
          id="products-section"
          style={{
            backgroundColor: '#f8fafc',
            padding: '4rem 1.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#0f172a',
                }}
              >
                Résultat de l'analyse IA
              </h2>
              <button
                style={{
                  padding: '0.75rem 1.2rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  color: '#334155',
                }}
                onClick={() => setSelectedSearchProduct(null)}
              >
                Retour aux résultats
              </button>
            </div>
            <ResultatAnalyse product={selectedSearchProduct} />
          </div>
        </section>
      ) : !isAnalyzing && ingredientResult ? (
        <section
          id="products-section"
          style={{
            backgroundColor: '#f8fafc',
            padding: '4rem 1.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                Résultat de l'analyse IA
              </h2>
              <button
                style={{
                  padding: '0.75rem 1.2rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  color: '#334155',
                }}
                onClick={() => {
                  setIngredientResult(null);
                  setSearchQuery('');
                }}
              >
                ← Nouvelle recherche
              </button>
            </div>
            <ResultatAnalyse product={ingredientResult} isIngredientSearch={true} />
          </div>
        </section>
      ) : (
        <ProductsSection
          displayProducts={displayProducts}
          user={user}
          handleAddFavorite={addFavorite}
          handleOpenComments={handleOpenComments}
          onClickCard={handleSelectSearchProduct}
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