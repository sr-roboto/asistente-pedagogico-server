# Guía de Despliegue en VPS (RAG + Ollama + Vector DB)

Esta guía te ayudará a configurar tu servidor VPS y desplegar la aplicación completa (Frontend, Backend RAG, Base de Datos Vectorial y Ollama).

## 1. Selección del Sistema Operativo
En el panel de tu proveedor (según tu captura de pantalla):
1. Selecciona la imagen **"Docker on Ubuntu 24.04"** (o "Docker on Debian 12").
   - *¿Por qué?* Esta imagen ya viene con Docker preinstalado, ahorrándote tiempo de configuración.
2. Completa el proceso de instalación del VPS.
3. Anota la **IP Pública**, el **Usuario** (usualmente `root`) y la **Contraseña** que te asignen.

## 3. Transferencia de Archivos (Método Git - Recomendado)
Como elegiste usar Git, sigue estos pasos:

### Paso A: En tu computadora local (VS Code)
Sube los archivos de configuración (`deploy_vps.sh`, `docker-compose.vps.yml`) a tu repositorio:
```powershell
# Abre una NUEVA terminal en VS Code
git add .
git commit -m "Configuración VPS y Ollama"
git push origin main
```

### Paso B: En el VPS
Vuelve a la terminal donde tienes el SSH abierto:
```bash
# 1. Clona tu repositorio (si ya existe la carpeta, bórrala primero con: rm -rf tomi-chatbot)
git clone https://github.com/MARCOS-G-G/tomi-chatbot.git
cd tomi-chatbot

# 2. Ejecuta el despliegue (Ya está configurado para OLLAMA, no necesitas claves extra)
chmod +x deploy_vps.sh
./deploy_vps.sh
```

## 4. Verificación
Una vez que el script termine (puede tardar descargando el modelo):
1.  Verifica que los contenedores estén corriendo:
    ```bash
    docker ps
    ```
2.  Abre tu navegador en: `http://149.50.142.96`

## 5. Carga de Documentos (Base de Conocimiento)
Para que el RAG funcione, necesitas subir tus PDFs a la carpeta `server/data` del VPS.
*Nota: Como usas Git, la carpeta `data` estará vacía. Tienes que subir los PDFs manualmente por SCP.*

```powershell
# Desde tu PC local (Terminal nueva)
scp -P 5377 C:\Users\marco\Documents\tomi-chatbot\server\data\*.pdf root@149.50.142.96:/root/tomi-chatbot/server/data/
```
Luego reinicia el servidor para procesarlos:
```bash
# En el VPS
docker compose -f docker-compose.vps.yml restart server
```

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
