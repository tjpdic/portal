const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o Admin SDK para ter privilégios totais no Firebase Auth
admin.initializeApp();

exports.sincronizarSenhaAuth = functions.https.onCall(async (data, context) => {
    const { nick, novaSenha } = data;

    // Trava de segurança básica
    if (!nick || !novaSenha || novaSenha.length < 6) {
        throw new functions.https.HttpsError(
            "invalid-argument", 
            "Nick e nova senha (mínimo 6 caracteres) são obrigatórios."
        );
    }

    const docId = nick.toLowerCase();
    const emailFantasma = `${docId}@tjp.intranet`;

    try {
        // 1. Busca o usuário no Firebase Auth usando o e-mail fantasma
        const userRecord = await admin.auth().getUserByEmail(emailFantasma);

        // 2. Força a atualização da senha no cofre do Auth
        await admin.auth().updateUser(userRecord.uid, {
            password: novaSenha
        });

        return { success: true, message: "Senha sincronizada com sucesso no Auth!" };
        
    } catch (error) {
        console.error("Erro ao sincronizar senha no Auth:", error);
        
        // Se o usuário não existir no Auth, retornamos um erro claro
        if (error.code === 'auth/user-not-found') {
            throw new functions.https.HttpsError(
                "not-found", 
                "Conta não encontrada no sistema de autenticação."
            );
        }
        
        throw new functions.https.HttpsError(
            "internal", 
            "Erro interno ao processar a requisição."
        );
    }
});