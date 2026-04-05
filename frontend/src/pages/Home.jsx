// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composants
import Navbar from '../components/Home/Navbar';
import HeroSection from '../components/Home/HeroSection';
import SearchSection from '../components/Home/SearchSection';
import ScannerSection from '../components/Home/ScannerSection';
import ProductsSection from '../components/Home/ProductsSection';
import Chatbot from '../components/Home/Chatbot';
import Footer from '../components/Home/Footer';

// Modals
import FavoritesModal from '../components/modals/FavoritesModal';
import HistoryModal from '../components/modals/HistoryModal';
import CommentsModal from '../components/modals/CommentsModal';
import ProfileModal from '../components/modals/ProfileModal';

// Hooks personnalisés
import useFavorites from '../hooks/useFavorites';
import useHistory from '../hooks/useHistory';
import useComments from '../hooks/useComments';

const Home = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // États Modals
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Produits
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');

  // Chatbot
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Bonjour ! Je suis votre assistant BioScan.' }
  ]);

  // ✅ Hooks personnalisés — passe userId ET userRole à useFavorites
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.id, user?.role);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useHistory(user?.id);
  const { comments, getProductComments, getAverageRating, addComment, editComment, deleteComment } = useComments();

  // Chargement produits depuis API
  useEffect(() => {
    fetch('http://localhost:5000/api/produits?status=approved')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setDisplayProducts(data);
      })
      .catch(() => console.log('API indisponible'));
  }, []);

  // Redirection admin
  useEffect(() => {
    if (user?.role === 'administrateur') navigate('/dashboard/AdminDashboard', { replace: true });
  }, [user, navigate]);

  // Ouvre le modal commentaires
  const handleOpenComments = (product) => {
    setSelectedProduct(product);
    setShowComments(true);
  };

  // Fermeture propre du modal commentaires
  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedProduct(null);
  };

  return (
    <div>
      <Navbar
        user={user}
        favoritesCount={favorites.length}
        onFavoritesClick={() => setShowFavorites(true)}
        onHistoryClick={() => setShowHistory(true)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={() => { logout(); navigate('/'); }}
      />

      {showFavorites && (
        <FavoritesModal
          favorites={favorites}
          onClose={() => setShowFavorites(false)}
          onRemoveFavorite={removeFavorite}
        />
      )}

      {showHistory && (
        <HistoryModal
          history={searchHistory}
          onClose={() => setShowHistory(false)}
          onRemoveItem={removeFromHistory}
          onClearAll={clearHistory}
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
          onLogout={() => { logout(); navigate('/'); }}
        />
      )}

      <HeroSection />
      <SearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        displayProducts={displayProducts}
        addToHistory={addToHistory}
      />
      <ScannerSection barcode={barcode} setBarcode={setBarcode} />

      <ProductsSection
        displayProducts={displayProducts}
        handleAddFavorite={addFavorite}
        handleOpenComments={handleOpenComments}
        isFavorite={isFavorite}
        getAverageRating={getAverageRating}
        getProductComments={getProductComments}
        user={user}  // ✅ passe l'utilisateur à ProductsSection → ProductCard
      />

      {/* Chatbot uniquement pour les consommateurs */}
      {user?.role === 'consommateur' && (
        <Chatbot
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          user={user}
          addToHistory={addToHistory}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;
