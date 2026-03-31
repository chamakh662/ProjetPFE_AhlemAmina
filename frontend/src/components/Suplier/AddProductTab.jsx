import React, { useState } from 'react';

// Composant pour ajouter un point
const AddPointForm = ({ newPoint, setNewPoint, handleAddPoint, loading }) => (
  <div style={styles.inlineBox}>
    <input
      type="text"
      placeholder="Nom du point de vente"
      value={newPoint.nom}
      onChange={(e) => setNewPoint({ ...newPoint, nom: e.target.value })}
      style={styles.input}
    />
    <input
      type="text"
      placeholder="Adresse"
      value={newPoint.adresse}
      onChange={(e) => setNewPoint({ ...newPoint, adresse: e.target.value })}
      style={styles.input}
    />
    {newPoint.adresse.trim() && (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newPoint.adresse)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#1976D2', textDecoration: 'underline', marginLeft: '10px' }}
      >
        Voir sur Google Maps
      </a>
    )}
    <button onClick={handleAddPoint} style={styles.secondaryButton} disabled={loading}>
      + Ajouter
    </button>
  </div>
);

const AddProductTab = ({ user }) => {
  const [productForm, setProductForm] = useState({
    nom: '',
    description: '',
    code_barre: '',
    origine: '',
    ingredients: '',
    image: '',
    pointsDeVente: []
  });
  const [pointsDeVente, setPointsDeVente] = useState([]);
  const [newPoint, setNewPoint] = useState({ nom: '', adresse: '' });
  const [loading, setLoading] = useState(false);

  const canSubmit =
    productForm.nom?.trim() &&
    productForm.description?.trim() &&
    productForm.code_barre?.trim() &&
    productForm.origine?.trim();
  const isMongoObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || '').trim());

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Erreur lecture image'));
      reader.readAsDataURL(file);
    });

  const handleAddPoint = async (e) => {
    e.preventDefault();
    if (!newPoint.nom.trim() || !newPoint.adresse.trim()) return;

    try {
      const res = await fetch('/api/pointDeVente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: newPoint.nom.trim(),
          adresse: newPoint.adresse.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur ajout point de vente');

      setProductForm((prev) => ({
        ...prev,
        pointsDeVente: [...(prev.pointsDeVente || []), data._id]
      }));

      setPointsDeVente((prev) => [...prev, data]);
      setNewPoint({ nom: '', adresse: '' });
    } catch (err) {
      alert(err.message || 'Erreur lors de l’ajout du point de vente');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert('Veuillez vous connecter');
      return;
    }
    if (!canSubmit) {
      alert('Veuillez remplir les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      const cleanedPoints = (productForm.pointsDeVente || [])
        .map((id) => String(id).trim())
        .filter((id) => id && isMongoObjectId(id));

      if ((productForm.pointsDeVente || []).length !== cleanedPoints.length) {
        throw new Error('Un point de vente invalide a été détecté. Supprimez-le puis ajoutez-le à nouveau avec "+ Ajouter".');
      }

      const payload = { ...productForm, pointsDeVente: cleanedPoints, createdBy: user.id };
      const res = await fetch('/api/produits/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission');

      alert('Produit soumis et en attente de validation par l’admin ✅');

      setProductForm({
        nom: '',
        description: '',
        code_barre: '',
        origine: '',
        ingredients: '',
        image: '',
        pointsDeVente: []
      });
      setPointsDeVente([]);
    } catch (err) {
      alert(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Ajouter un Nouveau Produit</h2>
      <form onSubmit={handleAddProduct} style={styles.form}>
        <input
          placeholder="Nom du produit *"
          value={productForm.nom}
          onChange={(e) => setProductForm({ ...productForm, nom: e.target.value })}
          style={styles.input}
        />
        <textarea
          placeholder="Description *"
          value={productForm.description}
          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          style={styles.textarea}
        />
        <input
          placeholder="Code-barre *"
          value={productForm.code_barre}
          onChange={(e) => setProductForm({ ...productForm, code_barre: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Origine *"
          value={productForm.origine}
          onChange={(e) => setProductForm({ ...productForm, origine: e.target.value })}
          style={styles.input}
        />
        <textarea
          placeholder="Ingrédients"
          value={productForm.ingredients}
          onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
          style={styles.textarea}
        />
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const dataUrl = await readFileAsDataUrl(file);
              setProductForm({ ...productForm, image: dataUrl });
            } catch {
              alert('Impossible de lire l’image');
            }
          }}
          style={styles.input}
        />
        {productForm.image && (
          <img
            src={productForm.image}
            alt="Preview"
            style={{ maxWidth: '220px', borderRadius: '8px', marginTop: '10px' }}
          />
        )}

        {/* Sélection points de vente */}
        <select
          multiple
          value={productForm.pointsDeVente || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
            setProductForm({ ...productForm, pointsDeVente: selected });
          }}
          style={styles.select}
        >
          {pointsDeVente.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nom}
            </option>
          ))}
        </select>

        <AddPointForm
          newPoint={newPoint}
          setNewPoint={setNewPoint}
          handleAddPoint={handleAddPoint}
          loading={loading}
        />

        <button type="submit" style={styles.submitButton}>
          {loading ? 'Envoi...' : 'Soumettre'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '600px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px'
  },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px' },
  select: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '100px' },
  inlineBox: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' },
  submitButton: { backgroundColor: '#4CAF50', color: '#fff', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#1976D2', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default AddProductTab;
