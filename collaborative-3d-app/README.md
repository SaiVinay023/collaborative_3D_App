# Collaborative 3D Sharing App

Stack: React + react-three-fiber + Socket.IO + Node/Express + MongoDB

Quick start:
- Start server: `cd server && npm install && npm run dev`
- Start client: `cd client && npm install && npm run dev`

## DEPLOYMENT 
                frontend:  https://cerulean-ganache-ef99e7.netlify.app/
              Backend: https://collaborative-3d-app.onrender.com


***

## Architecture

**Frontend:**  
- **React** (functional components, hooks)
- **@react-three/fiber** for rendering interactive 3D canvas  
- **Socket.IO** for real-time sync of actions (chat, camera, annotations)  
- **REST APIs** for persistent operations (project CRUD, file uploads, annotations)  
- **State Management:** Local hooks and a custom project store (useProjectStore.js).

**Backend:**  
- **Node.js + Express**  
- **MongoDB** (Project model with annotations, etc.)  
- **Socket.IO** for real-time collaboration  
- **REST API** endpoints for CRUD and data queries

***

## Workflow & Data Flow

**User Workflow**  
1. **Login** with username  
2. **Project Selection or Creation** (Sidebar)  
3. **Upload/Generate 3D Model (STL)**  
4. **Manipulate Model, Camera, and Scene**  
5. **Add Annotations** (click on 3D view and enter a label)  
6. **Live Chat** with other users  
7. **Changes saved and synchronized instantly (socket) or on save (API)**  
8. **Reload and restore project state**

**Data Flow**  
- UI events (click, camera move, annotation add) immediately update local state  
- Socket.IO emits sync events to all connected clients  
- Backend receives model/annotation changes and persists to database  
- REST endpoints support project and annotation persistence

***

## UI Flow

**Sidebar:**  
- Project selection  
- Creation and deletion  
- Upload STL

**Viewer Area:**  
- 3D canvas (model manipulation, orbit controls)
- Object manipulation panel (position, rotation, scale)  
- Camera angle buttons  
- Annotations—shown as pins/labels on the model  
- Clickable to add annotation (modal input appears)  
- Save: persists transformation and annotations

**Chat & Users Online:**  
- Live chat  
- List of connected users  
- Project settings (autosave toggle, max object count)

***

## Backend Details

**Project Model Schema:**  
- ID, name  
- modelUrl (STL)  
- annotations: array [{ position, text, user, type }]  
- other metadata

**API Routes:**  
- POST/GET for projects  
- POST for annotations  
- GET for project data (on load)

**Socket Events:**  
- join/leave project  
- broadcast: camera move, annotation add/delete, chat message  
- listen: annotation/project updates, chat, camera sync

***

## Architectural Decisions

- **React Three Fiber** for seamless WebGL integration and state-driven UI updates.
- **Socket.IO** for instant collaboration (no polling)  
- **MongoDB** for flexible schema (annotations, 3D transformations can be extended)  
- **Modular Components:** STLViewer, AnnotationMarker, Sidebar, Chat—ensures maintainability
- **Hooks for State:** Isolation per feature, custom store for project context  
- **REST + Socket Hybrid:** REST for persistence, socket for instant sync

***

## Execution Steps

1. **Clone repo & install** dependencies:
    ```bash
    git clone https://github.com/SaiVinay023/collaborative_3D_App
    cd collaborative_3D_App
    npm install
    cd server && npm install
    ```
2. **Start server and client:**
    ```bash
    cd server && npm run dev
    cd ../client && npm run dev
    ```
3. **Login, join/create project**
4. **Upload STL and view in 3D**
5. **Manipulate objects, use camera buttons**
6. **Click on model to add annotation, input short label**
7. **Annotations show immediately for all users**
8. **Chat and collaborate live**

***

## Implemented Functionalities

- User authentication/login
- Project management (create/join/delete)
- Upload and display STL models
- Camera manipulation (fixed views, orbit controls)
- Model manipulation (move, rotate, scale; persistent state)
- “Sticky” annotation creation and display (with modal prompt, user, text, associated geometry)
- Real-time annotation, chat, and scene sync
- Save & restore all project data (model, transformations, annotations)
- Responsive UI for web

***

## Additional Notes

- All changes instantly reflect for connected users by Socket.IO.
- UI is robust: project, user, chat, viewer, and settings panels.
- Designed for extensibility: support for future geometry types, export/import, access control.

***

