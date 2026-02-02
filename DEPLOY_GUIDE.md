# Guía de Despliegue en VPS (RAG + Ollama + Vector DB)

Esta guía te ayudará a configurar tu servidor VPS y desplegar la aplicación completa (Frontend, Backend RAG, Base de Datos Vectorial y Ollama).

## 1. Selección del Sistema Operativo
En el panel de tu proveedor (según tu captura de pantalla):
1. Selecciona la imagen **"Docker on Ubuntu 24.04"** (o "Docker on Debian 12").
   - *¿Por qué?* Esta imagen ya viene con Docker preinstalado, ahorrándote tiempo de configuración.
2. Completa el proceso de instalación del VPS.
3. Anota la **IP Pública**, el **Usuario** (usualmente `root`) y la **Contraseña** que te asignen.

## 2. Conexión al VPS
Desde tu computadora (Windows):
1. Espera unos minutos hasta que la barra amarilla "Instalando..." desaparezca del panel de DonWeb.
2. Abre una terminal (PowerShell o CMD).
3. Conéctate por SSH (¡Ojo! Tu servidor usa el puerto 5377):
   ```powershell
   ssh -p 5377 root@149.50.142.96
   ```
4. Ingresa la contraseña que creaste en el paso anterior.
   *(Si te pregunta "Are you sure you want to continue connecting?", escribe `yes` y dale Enter)*.

## 3. Transferencia de Archivos
Necesitamos subir tu código al servidor. Puedes hacerlo de dos formas:

### Opción A: Usando Git (Recomendado si usas GitHub/GitLab)
Sube tu código a un repositorio y clónalo en el VPS:
```bash
git clone https://github.com/tu-usuario/tomi-chatbot.git
cd tomi-chatbot
```

### Opción B: Copia Directa (Si tienes el código solo en tu PC)
Desde tu terminal de Windows (NO dentro del SSH, abre una nueva):
```powershell
# Asegúrate de estar en la carpeta donde está 'tomi-chatbot'
cd C:\Users\marco\Documents
# Nota: scp usa -P (mayúscula) para el puerto
scp -P 5377 -r tomi-chatbot root@149.50.142.96:/root/
```

## 4. Despliegue Automático
Una vez que tengas la carpeta `tomi-chatbot` en el VPS:

1. Entra a la carpeta en el VPS:
   ```bash
   cd /root/tomi-chatbot
   ```

2. Ejecuta el script de instalación que he preparado (`deploy_vps.sh`):
   ```bash
   # Dar permisos de ejecución
   chmod +x deploy_vps.sh
   
   # Ejecutar despliegue
   ./deploy_vps.sh
   ```
   > **Nota:** Este script se encargará de levantar los contenedores de Docker (Ollama, Servidor RAG, Cliente) y descargar el modelo Llama 3.2.

## 5. Carga de Documentos (Base de Conocimiento)
Para que el RAG funcione, necesitas subir tus PDFs:
1. Copia tus archivos PDF a la carpeta `server/data` en el VPS.
   - Puedes usar WinSCP (programa visual, puerto 5377) o `scp`.
   ```powershell
   # Desde tu PC
   scp -P 5377 C:\ruta\a\tus\documentos\*.pdf root@149.50.142.96:/root/tomi-chatbot/server/data/
   ```
2. Reinicia el servidor para que procese los nuevos archivos (solo si ya estaba corriendo):
   ```bash
   docker compose -f docker-compose.vps.yml restart server
   ```
   *El servidor procesará los PDFs automáticamente al iniciar.*

## 6. Verificación
Abre tu navegador y visita: `http://<TU_IP_DEL_VPS>`
- Deberías ver la interfaz del chat.
- Prueba enviar un mensaje como "Hola".
- El sistema se conectará internamente con Ollama y te responderá.

---

### Solución de Problemas Comunes

- **Error de Memoria**: Si el modelo falla, tu VPS podría tener poca RAM. Para Llama 3.2, se recomiendan al menos 4GB de RAM.
- **Ollama Lento**: Si no tienes GPU, la respuesta será lenta porque se ejecuta en CPU. Es normal en VPS económicos.
- **Logs**: Para ver qué está pasando:
  ```bash
  docker compose -f docker-compose.vps.yml logs -f server
  # o
  docker compose -f docker-compose.vps.yml logs -f ollama
  ```
