## EventMesh – Microservices Docker / Kubernetes (Minikube + Ingress NGINX)

### 1. Objectif du projet

EventMesh est une petite application **microservices** servant de support pédagogique pour :

- **Docker**: conteneurisation des services
- **Kubernetes**: déploiement et orchestration
- **Services + DNS Kubernetes**: communication inter‑pods
- **PVC**: persistance des données PostgreSQL
- **Ingress NGINX**: exposition HTTP unique vers le frontend et les APIs

L’objectif est de comprendre l’**infrastructure cloud‑native**, plus que la logique métier.

---

### 2. Architecture

```text
Client Web (navigateur)
        |
        v
Ingress NGINX (eventmesh.local)
        |
        +--> Service frontend  (React + Nginx)
        |
        +--> Service event-service   (Node.js / Express, lecture events)
        |
        +--> Service booking-service (Node.js / Express, réservations)
                     |
                     v
               PostgreSQL (PVC)
```

Tous les composants sont packagés en **images Docker** et déployés sur **Kubernetes (minikube)**.

---

### 3. Prérequis

- **Système**: Windows 10 / 11
- **Outils**:
  - Docker Desktop (mode **Linux containers**)
  - `kubectl`
  - `minikube`
  - `git`

Vérification rapide :

```bash
docker --version
kubectl version --client
minikube version
```

---

### 4. Installation du projet

```bash
git clone <URL_DU_REPO>
cd eventmesh
```

Structure utile :

```text
eventmesh/
├── frontend/          # SPA React + Nginx
├── event-service/     # API lecture d’événements
├── booking-service/   # API réservations
├── k8s/               # manifests Kubernetes (services, ingress, postgres…)
└── readme.md
```

---

### 5. Démarrer le cluster Kubernetes (minikube)

```bash
minikube start
kubectl get nodes
```

Le nœud `minikube` doit être en `Ready`.

---

### 6. Commandes pour lancer et tester le projet (Windows / macOS / Linux)

#### 6.1 Windows (PowerShell)

```powershell
# Installer l’ingress NGINX (une seule fois)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=180s
  
# Passer le service en LoadBalancer (nécessaire pour minikube tunnel)
# Note: En PowerShell, utilise --type=json pour éviter les problèmes d'échappement
kubectl -n ingress-nginx patch svc ingress-nginx-controller --type=json -p '[{\"op\":\"replace\",\"path\":\"/spec/type\",\"value\":\"LoadBalancer\"}]'


# Déployer tous les manifests Kubernetes
kubectl apply -R -f k8s/
kubectl get pods

# Initialiser la base PostgreSQL 
kubectl exec -it postgres-XXXXX -- psql -U admin -d eventdb

# Creation des tables et insertion des données

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    capacity INTEGER NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events (title, date, capacity) VALUES
('Cloud Conference', '2026-03-01', 100),
('Kubernetes Workshop', '2026-04-10', 50),
('DevOps Meetup', '2026-05-20', 30);

SELECT * FROM events;
\q


# Configurer le DNS local et exposer l’Ingress

Dans C:\Windows\System32\drivers\etc\hosts ajouter : 127.0.0.1 eventmesh.local

Option A : minikube tunnel (recommandé, expose directement sur port 80)

minikube tunnel

# (laisser ce terminal ouvert, puis ouvrir dans le navigateur)

Option B : port-forward (alternative, utilise le port 8080)

kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80

Puis ouvrir dans le navigateur :

- **Avec `minikube tunnel`** : `http://eventmesh.local/`, `http://eventmesh.local/api/events`, `http://eventmesh.local/api/bookings`
- **Avec port-forward** : `http://eventmesh.local:8080/`, `http://eventmesh.local:8080/api/events`, `http://eventmesh.local:8080/api/bookings`

```

#### 6.2 macOS / Linux (bash)

```bash
# Cloner le projet
git clone <URL_DU_REPO>
cd eventmesh

# Vérifier les outils
docker --version
kubectl version --client
minikube version

# Démarrer Minikube
minikube start

# Installer l’ingress NGINX (une seule fois)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

# Passer le service ingress-nginx-controller en LoadBalancer (nécessaire pour minikube tunnel)
kubectl -n ingress-nginx patch svc ingress-nginx-controller --type=json -p '[{"op":"replace","path":"/spec/type","value":"LoadBalancer"}]'

# Déployer tous les manifests Kubernetes
kubectl apply -R -f k8s/
kubectl get pods

# Initialiser la base PostgreSQL 
kubectl exec -it postgres-XXXXX -- psql -U admin -d eventdb

# Creation des tables et insertion des données

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    capacity INTEGER NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events (title, date, capacity) VALUES
('Cloud Conference', '2026-03-01', 100),
('Kubernetes Workshop', '2026-04-10', 50),
('DevOps Meetup', '2026-05-20', 30);

SELECT * FROM events;
\q

# Configurer le DNS local et exposer l’Ingress

macOS: dans /etc/hosts ajouter : 127.0.0.1 eventmesh.local

Linux : dans /etc/hosts ajouter : IngressAddress eventmesh.local

Vous trouverez IngressAddress en faisant kubectl get ingress et en récupérant l'adresse
# Si l'adresse n'apparait pas, patientez un moment et relancez la commande, jusqu'à obtenir l'IngressAdress

Option A : minikube tunnel (recommandé, expose directement sur port 80)
minikube tunnel
# (laisser ce terminal ouvert, puis ouvrir dans le navigateur)

Option B : port-forward (alternative, utilise le port 8080)
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```

Puis ouvrir dans le navigateur (selon l’option choisie) :

- **Avec `minikube tunnel`** : `http://eventmesh.local/`, `http://eventmesh.local/api/events`, `http://eventmesh.local/api/bookings`
- **Avec port-forward** : `http://eventmesh.local:8080/`, `http://eventmesh.local:8080/api/events`, `http://eventmesh.local:8080/api/bookings`

---

### 7. Tests réseau Kubernetes

#### 7.1 APIs via Ingress

- **Avec `minikube tunnel`** : `http://eventmesh.local/api/events`, `http://eventmesh.local/api/bookings`
- **Avec port-forward** : `http://eventmesh.local:8080/api/events`, `http://eventmesh.local:8080/api/bookings`

#### 7.2 Communication inter‑services (DNS interne)

```bash
kubectl exec -it event-service-XXXXX -- sh
apk add --no-cache curl
curl http://booking-service:8082/api/bookings
curl http://event-service:8081/api/events
exit
```

Ces commandes valident le **DNS interne Kubernetes** (`booking-service`, `event-service`) et le réseau virtuel des Services.

---

### 8. Persistance (PVC PostgreSQL)

1. Compter les événements :

```bash
kubectl exec -it postgres-XXXXX -- \
  psql -U admin -d eventdb -c "SELECT count(*) FROM events;"
```

2. Redémarrer le pod PostgreSQL :

```bash
kubectl delete pod postgres-XXXXX
kubectl get pods
```

3. Recompter :

```bash
kubectl exec -it postgres-NEWXXXXX -- \
  psql -U admin -d eventdb -c "SELECT count(*) FROM events;"
```

Le nombre doit être identique : les données sont conservées grâce au **PersistentVolumeClaim**.

---

### 9. (Optionnel) Rebuilder et publier votre propre image frontend

Par défaut, le frontend est une image publique référencée dans `k8s/frontend/deployment.yml`.  
Si vous modifiez le code du frontend, publiez votre image Docker Hub et mettez à jour le manifest.

```bash
cd frontend
docker build -t MONUSER/eventmesh-frontend:ingress .
docker login
docker push MONUSER/eventmesh-frontend:ingress
```

Puis dans `k8s/frontend/deployment.yml` :

```yaml
image: MONUSER/eventmesh-frontend:ingress
```

---

### 10. Dépannage (les erreurs les plus courantes)

- **`ImagePullBackOff` / `ErrImagePull` sur le frontend**
  - Vérifier que l’image indiquée dans `k8s/frontend/deployment.yml` existe réellement sur Docker Hub.
  - Diagnostic :

```bash
kubectl describe pod -l app=frontend
```

- **Le navigateur n’accède pas à `eventmesh.local`**
  - Vérifier `hosts` (Windows) : `127.0.0.1 eventmesh.local`
  - Vérifier que le port-forward tourne :

```bash
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```

- **Pas d’événements affichés**
  - Faire l’initialisation Postgres (section 6) et vérifier :

```bash
kubectl exec -it postgres-XXXXX -- psql -U admin -d eventdb -c "SELECT * FROM events;"
```

---

### 11. Nettoyage

```bash
kubectl delete -R -f k8s/
minikube stop
```

---

### 12. Captures d’écran

- Interface utilisateur : `./docs/ui.png`
- État du cluster Kubernetes : `./docs/kubectl-pods.png`
- Communication inter‑services : `./docs/interservice-curl.png`

---

### 13. Résumé technique

- **Docker** : construction et distribution des images
- **Kubernetes / minikube** : orchestration locale
- **Services + DNS** : découverte et communication entre microservices
- **PVC** : persistance de la base PostgreSQL
- **Ingress NGINX** : point d’entrée unique pour frontend + APIs
- **Stack applicative** : Node.js / Express, React, PostgreSQL

---

### Auteur

OKRY Marie‑Grâce
