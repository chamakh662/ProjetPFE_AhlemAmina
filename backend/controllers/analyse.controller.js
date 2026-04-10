const Analyse = require('../models/analyse.model');
const { spawn } = require('child_process');
const path = require('path');

// ─── CREATE ─────────────────────────────────────────────────────────────────

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

// ─── GET ALL ─────────────────────────────────────────────────────────────────

exports.getAllAnalyses = async (req, res) => {
    try {
        const analyses = await Analyse.find().populate('produit');
        res.status(200).json(analyses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────

exports.getAnalyseById = async (req, res) => {
    try {
        const analyse = await Analyse.findById(req.params.id).populate('produit');
        if (!analyse) return res.status(404).json({ message: 'Analyse non trouvée' });
        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

exports.updateAnalyse = async (req, res) => {
    try {
        const analyse = await Analyse.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!analyse) return res.status(404).json({ message: 'Analyse non trouvée' });
        res.status(200).json(analyse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

exports.deleteAnalyse = async (req, res) => {
    try {
        const analyse = await Analyse.findByIdAndDelete(req.params.id);
        if (!analyse) return res.status(404).json({ message: 'Analyse non trouvée' });
        res.status(200).json({ message: 'Analyse supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── PREDICT (pipeline Python ML) ────────────────────────────────────────────
// Appelé par POST /api/analyses/predict  ← Sandbox du composant AiAnalysisTab

exports.predictIngredients = (req, res) => {
    const payload = JSON.stringify(req.body);

    // Chemin vers votre script Python (predictor.py à la racine du backend)
    const scriptPath = path.join(__dirname, '..', 'predictor.py');
    const pythonBin = process.env.PYTHON_BIN || 'python';

    const py = spawn(pythonBin, [scriptPath]);

    let stdout = '';
    let stderr = '';

    py.stdin.write(payload);
    py.stdin.end();

    py.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    py.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    py.on('close', (code) => {
        // stderr peut contenir des warnings sklearn/pandas sans être une vraie erreur
        if (code !== 0 && !stdout) {
            console.error('[Python stderr]', stderr);
            return res.status(500).json({
                message: 'Erreur dans le script Python',
                detail: stderr.slice(0, 300),
            });
        }

        try {
            // Nettoyage au cas où pandas affiche des warnings avant le JSON
            const jsonStart = stdout.indexOf('{');
            const clean = jsonStart !== -1 ? stdout.slice(jsonStart) : stdout;
            const result = JSON.parse(clean.trim());

            if (result.error) {
                return res.status(500).json({ message: result.error });
            }

            return res.status(200).json(result);
        } catch (e) {
            console.error('[JSON parse error]', stdout);
            return res.status(500).json({
                message: 'Réponse Python non-JSON',
                raw: stdout.slice(0, 300),
            });
        }
    });

    py.on('error', (err) => {
        console.error('[spawn error]', err);
        return res.status(500).json({
            message: `Impossible de lancer Python : ${err.message}`,
        });
    });
};

// Alias pour compatibilité avec l'ancienne route /predict
exports.predictProduct = exports.predictIngredients;