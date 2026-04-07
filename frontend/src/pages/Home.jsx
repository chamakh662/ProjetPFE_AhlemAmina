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

// Composants consommateur uniquement
import Chatbot from '../components/Home/Chatbot';
import FavoritesModal from '../components/modals/FavoritesModal';
import HistoryModal from '../components/modals/HistoryModal';
import CommentsModal from '../components/modals/CommentsModal';
import ProfileModal from '../components/modals/ProfileModal';

// Hooks
import useFavorites from '../hooks/useFavorites';
import useHistory from '../hooks/useHistory';
import useComments from '../hooks/useComments';

const Home = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const isConsommateur = user?.role === 'consommateur';

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ── Produits ───────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');

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
    fetch('http://localhost:5000/api/produits?status=approved')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        setDisplayProducts(data);
      })
      .catch(() => console.log('API indisponible'));
  }, []);

  // Réinitialise displayProducts quand la recherche est effacée
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayProducts(allProducts);
    }
  }, [searchQuery, allProducts]);

  // ── Recherche ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setDisplayProducts(allProducts);
      return;
    }

    const results = allProducts.filter(
      (p) =>
        p.nom?.toLowerCase().includes(query) ||
        p.name?.toLowerCase().includes(query) ||
        p.titre?.toLowerCase().includes(query) ||
        p.libelle?.toLowerCase().includes(query)
    );

    setDisplayProducts(results);

    // Historique uniquement pour les consommateurs et si résultats trouvés
    if (isConsommateur && results.length > 0) {
      addToHistory(searchQuery.trim());
    }
  };

  // ── Commentaires ───────────────────────────────────────────────────────────
  const handleOpenComments = (product) => {
    setSelectedProduct(product);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedProduct(null);
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
        // Ces props sont ignorées par la Navbar si l'utilisateur n'est pas consommateur
        favoritesCount={isConsommateur ? favorites.length : 0}
        onFavoritesClick={() => isConsommateur && setShowFavorites(true)}
        onHistoryClick={() => isConsommateur && setShowHistory(true)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={handleLogout}
      />

      {/* ── Modals consommateur ────────────────────────────────────────── */}
      {isConsommateur && showFavorites && (
        <FavoritesModal
          favorites={favorites}
          onClose={() => setShowFavorites(false)}
          onRemoveFavorite={removeFavorite}
        />
      )}

      {isConsommateur && showHistory && (
        <HistoryModal
          history={searchHistory}
          onClose={() => setShowHistory(false)}
          onRemoveItem={removeFromHistory}
          onClearAll={clearHistory}
          onUseItem={(item) => {
            setSearchQuery(item.query);
            setShowHistory(false);
          }}
        />
      )}

      {showComments && selectedProduct && (
        <CommentsModal
          product={selectedProduct}
          comments={comments}
          user={user}
          onClose={handleCloseComments}
          onAddComment={addComment}
          onEditComment={editComment}
          onDeleteComment={deleteComment}
        />
      )}

      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={updateUser}
          onLogout={handleLogout}
        />
      )}

      {/* ── Sections communes ──────────────────────────────────────────── */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        displayProducts={displayProducts}
        handleSearch={handleSearch}
      />



      <ScannerSection
        barcode={barcode}
        setBarcode={setBarcode}
        handleBarcodeScan={() => {
          /* TODO: implémenter le scan */
        }}
      />

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

      {/* ── Chatbot — consommateur uniquement ─────────────────────────── */}
      {isConsommateur && <Chatbot user={user} addToHistory={addToHistory} />}

      <Footer />
    </div>
  );
};

export default Home;