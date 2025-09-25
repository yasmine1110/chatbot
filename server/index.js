
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors({ 
  origin: ['https://chatbot-beta-liard.vercel.app'],
  credentials: true
}));
app.use(express.json());

const PORT = 5000;

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY manquante dans .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


function isHealthRelated(question) {
  if (!question || typeof question !== 'string') {
    console.log('❌ Question invalide');
    return false;
  }
  
  const questionLower = question.toLowerCase().trim();
  console.log('🔍 Analyse de la question:', questionLower);
  
  // Liste exhaustive de mots-clés santé
  const healthKeywords = [
    // Termes généraux santé
    'santé', 'médical', 'médecin', 'docteur', 'hôpital', 'clinique', 'infirmier',
    'soins', 'traitement', 'diagnostic', 'symptôme', 'maladie', 'pathologie',
    'médicament', 'ordonnance', 'consultation', 'urgence', 'vaccin', 'allergie',
    'douleur', 'fièvre', 'nausée', 'vomissement', 'fatigue', 'faiblesse',
    
    // Systèmes corporels
    'cardiaque', 'respiratoire', 'digestif', 'neurologique', 'psychologique',
    'musculaire', 'squelettique', 'immunitaire', 'endocrinien', 'reproductif',
    
    // Spécialités médicales
    'cardiologie', 'dermatologie', 'gynécologie', 'pédiatrie', 'psychiatrie',
    'neurologie', 'ophtalmologie', 'orthopédie', 'dentiste', 'nutrition',
    'diététique', 'kinésithérapie', 'physiothérapie', 'chirurgie', 'urologie',
    'gastroentérologie', 'pneumologie', 'rhumatologie', 'oncologie',
    
    // Parties du corps
    'cœur', 'poumon', 'foie', 'rein', 'cerveau', 'estomac', 'intestin',
    'muscle', 'os', 'articulation', 'peau', 'yeux', 'oreilles', 'nez',
    'bouche', 'dents', 'gorge', 'dos', 'ventre', 'tête', 'cou', 'bras',
    'jambe', 'pied', 'main', 'doigt', 'ongle', 'cheveux', 'sang',
    
    // Termes bien-être
    'prévention', 'hygiène', 'bien-être', 'forme', 'régime', 'exercice',
    'sommeil', 'stress', 'anxiété', 'dépression', 'énergie', 'vitamine',
    'minéral', 'complément', 'alimentation', 'régime alimentaire',
    
    // Questions courantes
    'quoi faire', 'que faire', 'comment soigner', 'comment traiter',
    'quels symptômes', 'quels traitements', 'causes de', 'conséquences de',
    'quelles précautions', 'comment prévenir'
  ];

  // Vérifier les mots-clés standards
  const hasHealthKeyword = healthKeywords.some(keyword => {
    const found = questionLower.includes(keyword.toLowerCase());
    if (found) {
      console.log('✅ Mot-clé santé trouvé:', keyword);
    }
    return found;
  });

  
  const diseasePatterns = [
    /(\w+ite\b)/gi,    // bronchite, gastrite, etc.
    /(\w+ose\b)/gi,    // arthrose, tuberculose, etc.
    /(\w+isme\b)/gi,   // rhumatisme, etc.
    /(\w+opathie\b)/gi, // neuropathie, etc.
    /(\w+émie\b)/gi,   // leucémie, etc.
    /(\w+ome\b)/gi,    // gliome, etc.
  ];

  let hasDiseasePattern = false;
  let patternMatch = null;
  
  for (const pattern of diseasePatterns) {
    const match = questionLower.match(pattern);
    if (match) {
      hasDiseasePattern = true;
      patternMatch = match[0];
      console.log('✅ Pattern maladie trouvé:', patternMatch);
      break;
    }
  }

  // Vérifier les maladies spécifiques
  const specificDiseases = questionLower.match(/\b(paludisme|diabète|cancer|asthme|hypertension|hépatite|rougeole|tuberculose|vih|sida|alzheimer|anémie|arthrose|ebola|choléra|pandémie|épidémie|grippe|COVID|coronavirus)\b/gi);
  if (specificDiseases) {
    console.log('✅ Maladie spécifique trouvée:', specificDiseases[0]);
  }

  // Vérifier les questions sur les symptômes ou traitements
  const hasHealthQuestion = /(quels sont les|qu'est-ce que|comment|pourquoi|quand|où).*(symptômes|traitement|cause|prévention|soins|médicament)/gi.test(questionLower);
  if (hasHealthQuestion) {
    console.log('✅ Question santé détectée');
  }

  // Accepter les salutations pour engager la conversation
  const isGreeting = /^(bonjour|salut|hello|hi|bonsoir|bonne nuit)/gi.test(questionLower);
  if (isGreeting) {
    console.log('✅ Salutation détectée');
  }

  const result = hasHealthKeyword || hasDiseasePattern || specificDiseases || hasHealthQuestion || isGreeting;
  console.log('🔍 Résultat final de détection:', result);
  
  return result;
}

app.get('/', (req, res) => {
  res.json({ message: 'Serveur Express fonctionnel!', status: 'OK' });
});

app.get('/api/models', async (req, res) => {
  try {
    const models = await genAI.listModels();
    const modelList = models.models.map(model => ({
      name: model.name,
      supportedMethods: model.supportedGenerationMethods
    }));
    res.json({ models: modelList });
  } catch (error) {
    console.error('Erreur liste modèles:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  console.log('📩 Message reçu:', message);

  if (!message) {
    return res.status(400).json({ error: 'Message requis' });
  }

  // Vérifier si la question concerne la santé
  const isHealth = isHealthRelated(message);
  
  if (!isHealth) {
    console.log('❌ Question hors domaine santé');
    return res.status(400).json({ 
      error: 'Désolé, je ne réponds qu\'aux questions concernant la santé, les maladies et le bien-être médical. Veuillez poser une question relative à la santé.' 
    });
  }

  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    // Ajouter le contexte médical directement dans le prompt utilisateur
    const enhancedPrompt = `
    Tu es un assistant médical expert.
Règles strictes :
- Réponds de façon brève mais bien detaillé.
- Donne seulement l'essentiel, clair et structuré.
- Ne mets pas d'astérisques (*).

 : "${message}"`;

    const result = await model.generateContentStream({
      contents: [{ 
        role: "user", 
        parts: [{ text: enhancedPrompt }] 
      }]
    });

    console.log('✅ Génération de contenu démarrée');

    // Stream de la réponse
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }

    res.end();
    console.log('✅ Réponse envoyée avec succès');

  } catch (error) {
    console.error('❌ Erreur Gemini:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`Erreur: ${error.message}`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur http://localhost:${PORT}`);
  console.log(`🔑 Clé API présente: ${!!process.env.GEMINI_API_KEY}`);
});