
***

# Collaborative 3D Sharing App

**Stack:** React + react-three-fiber + Socket.IO + Node/Express + MongoDB

## Quick Start

- Start server:  
  `cd server && npm install && npm run dev`
- Start client:  
  `cd client && npm install && npm run dev`

## Deployment

- **Frontend:**  
  https://cerulean-ganache-ef99e7.netlify.app/
- **Backend:**  
  https://collaborative-3d-app.onrender.com/

***

## Architecture Overview

Frontend:
- **React** (functional components, hooks)
- **@react-three/fiber** for interactive 3D canvas
- **Socket.IO** for real-time sync
- **REST APIs** for projects/annotations/models
- **State:** Custom project store (`useProjectStore.js`), hooks

Backend:
- **Node.js + Express**
- **MongoDB** (Project model)
- **Socket.IO** for collaboration
- **REST API** for CRUD/data queries

***

## User Workflow

1. **Login:** Dummy login, enter any name (no real auth)
2. **Create or Select Project:** Title, view/join existing
3. **Upload or Generate 3D Model:** STEP/STL (upload) or primitive geometry (cube/sphere/cone)
4. **Basic Controls:** Pan, zoom, rotate camera
5. **Manipulate Model:** Move, rotate, scale model
6. **Persist Scene:** Scene saves automatically or via save button; reload restores  
7. **Add Annotation:** Click model, add label
8. **Live Chat & Sync:** Scene, chat, annotations sync instantly

***

## What’s Fully Implemented

**Phase 0 & 1 (Complete):**
- Dummy login screen (`name` only for user)
- Create project with title
- List projects
- Upload and view STEP/STL model (or primitives)
- Viewport controls: pan, zoom, rotate
- Manipulate geometry: move, rotate, scale
- Changes save and reload
- Basic chat annotation framework

**Phases 2, 3, 4 (Partial):**
- Most key features above function; some extended features in advanced phases may be stubbed or partly done (see notes below).

***

## UI

Sidebar:
- Project select/create/delete
- Upload STL

Viewer:
- 3D canvas (manipulation/orbit controls)
- Object panel (position/rotation/scale)
- Camera buttons
- Add annotation (modal input)
- Save

Chat & Users:
- Basic live chat  
- Connected users list

***

## Backend Details

Project Model:
- ID/name
- modelUrl (STL)
- annotations: [{ position, text, user, type }]
- etc.

API:
- Projects: POST/GET
- Annotations: POST/GET
- Project state: GET

Socket Events:
- join/leave project
- camera, annotation, chat sync
- annotation/project/chat updates

***

## Architectural Decisions

- **React Three Fiber:** For easy WebGL integration and state-driven UI.
- **Socket.IO:** Instant updates.
- **MongoDB:** Flexible schema.
- **Component/Hook modularity:** For maintainability.
- **REST + Socket hybrid:** Persistence & instant sync.

***

## Execution Steps

1. Clone and install dependencies:
    ```bash
    git clone https://github.com/SaiVinay023/collaborative_3D_App
    cd collaborative_3D_App
    npm install
    cd server && npm install
    ```
2. Start server and client:
    ```bash
    cd server && npm run dev
    cd ../client && npm run dev
    ```
3. Login, join/create project, upload STL, manipulate/view, annotate, chat

***

## Feature Summary

- User authentication (dummy login)
- Project CRUD
- STL model upload/display
- Camera and model manipulation (move/rotate/scale)
- “Sticky” annotation (modal label, live sync)
- Real-time sync (model, chat, annotation)
- Save/restore scene
- Responsive UI

***

## Known/Partial Limitations

- File uploads are locally saved; may be lost on backend redeploy (consider S3 or permanent storage for production).
- No real authentication; dummy user login only.
- Only STL/STEP or basic primitives supported for model upload.
- Advanced annotation and access control features may be stubbed.
- Some extended phase functionalities are not fully implemented.

***

**All major features for Phase 0 and Phase 1 are fully working. Key features for manipulating, saving, and sharing the scene are implemented; advanced features are planned or partly completed.**
