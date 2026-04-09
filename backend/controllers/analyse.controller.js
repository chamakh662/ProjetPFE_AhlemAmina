const Analyse = require('../models/analyse.model');
const { spawn } = require('child_process');
const path = require('path');

// CREATE analyse
exports.createAnalyse = async (req, res) => {
    try {

        const analyse = new Analyse({
            id_analyse: req.body.id_analyse,
            produit: req.body.produit
        });

        const savedAnalyse = await analyse.save();

        res.status(201).json(savedAnalyse);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET ALL analyses
exports.getAllAnalyses = async (req, res) => {
    try {

        const analyses = await Analyse.find()
        .populate('produit');

        res.status(200).json(analyses);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET analyse by ID
exports.getAnalyseById = async (req, res) => {
    try {

        const analyse = await Analyse.findById(req.params.id)
        .populate('produit');

        if (!analyse) {
            return res.status(404).json({
                message: "Analyse non trouvée"
            });
        }

        res.status(200).json(analyse);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE analyse
exports.updateAnalyse = async (req, res) => {
    try {

        const analyse = await Analyse.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!analyse) {
            return res.status(404).json({
                message: "Analyse non trouvée"
            });
        }

        res.status(200).json(analyse);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// DELETE analyse
exports.deleteAnalyse = async (req, res) => {
    try {

        const analyse = await Analyse.findByIdAndDelete(req.params.id);

        if (!analyse) {
            return res.status(404).json({
                message: "Analyse non trouvée"
            });
        }

        res.status(200).json({
            message: "Analyse supprimée avec succès"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// PREDICT product using AI models
exports.predictProduct = async (req, res) => {
    try {
        const productData = req.body;
        
        // Use the global python interpreter as venv failed to build old sklearn
        const scriptPath = path.join(__dirname, '..', 'predictor.py');
        const pythonExecutable = 'python';
        
        const pythonProcess = spawn(pythonExecutable, [scriptPath]);
        
        let predictedData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data) => {
            predictedData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0 || errorData) {
                console.error("Python Error:", errorData);
                // Si l'erreur est juste un warning (ex: InconsistentVersionWarning), on continue si predictedData contient du JSON.
                if(!predictedData) {
                    return res.status(500).json({ message: "Error during prediction", error: errorData });
                }
            }
            
            try {
                // Tenter d'extraire la partie JSON depuis STDOUT
                const result = JSON.parse(predictedData);
                res.status(200).json(result);
            } catch (err) {
                // En cas d'avertissements de pandas/sklearn, essayer de nettoyer la sortie
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
        
        // Send JSON data to python script
        pythonProcess.stdin.write(JSON.stringify(productData));
        pythonProcess.stdin.end();

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
