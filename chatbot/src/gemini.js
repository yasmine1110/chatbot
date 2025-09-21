
// const API_KEY = "AIzaSyBqKhnyc3UK8MXSHucZfaq3POn9hEXNsrI"; // remplace avec ta vraie clé

// export async function fetchGeminiResponse(question) {
//   const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

//   const headers = {
//     "Content-Type": "application/json",
//     "x-goog-api-key": API_KEY
//   };

//   const body = JSON.stringify({
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text: `
// Tu es un assistant médical virtuel. Ton rôle est de :

// 1. Proposer des diagnostics probables à partir des symptômes fournis.
// 2. Donner des conseils de santé de base, comme l'hygiène, l'alimentation, le repos, ou quand consulter un médecin.
// 3. Tu ne donnes pas de traitements médicamenteux.
// 4. Tu ne remplaces pas un médecin.
// Tu es un assistant médical virtuel. Tu peux aider à :
// - Identifier les causes possibles de symptômes
// - Donner des conseils de santé simples (repos, hydratation, hygiène, etc.)
// - Indiquer s’il faut aller chez le médecin

// ⚠️ Tu ne prescris jamais de médicaments et tu ne remplaces pas un professionnel.

// Voici la question du patient : ${question}
//           `.trim()
//           }
//         ]
//       }
//     ]
//   });

//   try {
//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers,
//       body
//     });

//     const data = await response.json();

//     if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
//       return data.candidates[0].content.parts[0].text;
//     } else {
//       return "Je n'ai pas pu comprendre la question. Réessaie.";
//     }
//   } catch (error) {
//     console.error("Erreur lors de l'appel à Gemini :", error);
//     return "Une erreur est survenue. Vérifie ta connexion ou ta clé API.";
//   }
// }




