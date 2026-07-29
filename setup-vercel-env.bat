@echo off
echo ============================================
echo  Configurar env vars no Vercel (producao)
echo ============================================
echo.
echo Execute um por vez, substituindo os valores:
echo.

echo 1. SMTP (Brevo)
echo    vercel env add SMTP_HOST production
echo    ^> smtp-relay.brevo.com
echo.
echo    vercel env add SMTP_PORT production
echo    ^> 587
echo.
echo    vercel env add SMTP_USER production
echo    ^> (seu email da conta Brevo)
echo.
echo    vercel env add SMTP_PASS production
echo    ^> (sua chave SMTP - NAO a API key)
echo.
echo    vercel env add EMAIL_FROM production
echo    ^> noreply@osstrack.app
echo.
echo    vercel env add EMAIL_FROM_NAME production
echo    ^> OssTrack
echo.

echo 2. Dominio (apos registrar osstrack.app.br)
echo    vercel env add NEXTAUTH_URL production
echo    ^> https://osstrack.app.br
echo.

echo 3. ReCAPTCHA (opcional mas recomendado)
echo    vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY production
echo    ^> (pegar em https://www.google.com/recaptcha/admin)
echo.
echo    vercel env add RECAPTCHA_SECRET_KEY production
echo    ^> (mesmo valor)
echo.

echo Pronto! Deploy automatico: git push
