# Table Connector App - Detailed Plan

## 1. Objective
Develop a web-hosted table relationship selector app ("Table Connector") to visualize and define relationships between multiple CSV datasets. The app will be a standalone prototype integrated into the existing repository as a separate entry point.

## 2. Architecture & Tech Stack
-   **Framework:** React (via Vite existing build system).
-   **CSV Parsing:** `papaparse` library.
-   **Visual Connections:** `react-xarrows` library for drawing lines between DOM elements.
-   **Styling:** Custom CSS (`Table_Conn_styles.css`) focusing on an "Excel-like" grid layout.
-   **Entry Point:** `Table_Conn_index.html` in the project root.

## 3. File Structure
All source files related to this module will be prefixed with `Table_Conn_` to ensure isolation.

-   `Table_Conn_index.html` : The HTML entry point.
-   `src/Table_Conn_main.jsx` : The React root renderer.
-   `src/Table_Conn_App.jsx` : The main application container and state manager.
-   `src/Table_Conn_Table.jsx` : Component to render individual CSV tables.
-   `src/Table_Conn_Node.jsx` : Component for the interactive table headers (nodes).
-   `src/Table_Conn_Log.jsx` : Component for the logging panel.
-   `src/Table_Conn_styles.css` : Stylesheet.

## 4. Data Structures

### `tables` State
Stores the loaded CSV data.
```json
[
  {
    "id": "table-1",
    "name": "users.csv",
    "headers": ["id", "name", "email"],
    "rows": [
      ["1", "Alice", "alice@example.com"],
      ["2", "Bob", "bob@example.com"]
    ]
  }
]
```

### `connections` State
Stores the defined relationships (grouped nodes).
```json
[
  {
    "id": "C1",
    "serial": 1,
    "color": "#FF5733",
    "nodes": [
      { "tableId": "table-1", "headerIndex": 0, "headerName": "id" },
      { "tableId": "table-2", "headerIndex": 1, "headerName": "user_id" }
    ],
    "instructions": "Match user IDs",
    "startNode": "table-1-header-0",
    "endNode": "table-2-header-1"
  }
]
```

### `selectedNodes` State
Tracks currently selected nodes (before grouping).
```javascript
Set(["table-1-header-0", "table-3-header-2"])
```

## 5. UI Layout & Interaction Flow

### A. Loading Phase
1.  **File Upload:** A primary "Load CSVs" button triggers a file picker (multiple selection allowed).
2.  **Parsing:** `papaparse` reads headers + first 2 data rows.
3.  **Rendering:** Tables are displayed in a grid/flex layout. Each header cell contains a "Connector Icon" (Node).

### B. Selection & Grouping
1.  **Selection:** Clicking a Node toggles its selection state. Selected nodes appear larger/highlighted.
2.  **Grouping (Space Key):**
    -   When `Space` is pressed and >1 nodes are selected:
    -   Create a new Connection (C_n) with a unique ID and Color.
    -   Clear `selectedNodes`.
    -   Update the Nodes to display the Connection Serial Number (e.g., ①) inside the icon.
    -   Log entry created: "Group Created: C1 with [Table1.Col1, Table2.Col2]".

### C. Visualizing Connections
1.  **"Connect" Button:**
    -   Triggers the rendering of `<Xarrow>` components between grouped nodes.
    -   Lines are colored according to the Connection's assigned color.
    -   Lines persist visually.
2.  **Deleting Lines:**
    -   Clicking a line selects it (visual feedback).
    -   Pressing `Delete` removes the Connection (ungroups the nodes).

### D. Context Menu & Metadata
1.  **Right-Click on Node:**
    -   Opens a custom context menu.
    -   **Options:**
        -   `Set Start Node`: Marks this node as the origin of the relationship (updates Log).
        -   `Set End Node`: Marks this node as the destination (updates Log).
        -   `Add Instructions`: Opens a prompt/modal to enter text (e.g., "Left Join").
2.  **Log Updates:** Any change via context menu appends a formatted entry to the Log.

### E. Logging & Export
1.  **Log Panel:**
    -   Displays a chronological list of actions and current connection states.
    -   Format: Plain Text (machine-readable structure).
    -   Example: `[C1] CONNECTION: users.csv(id) -> orders.csv(user_id) | INSTRUCTION: Left Join`
2.  **Export:**
    -   "Export JSON" button downloads the `connections` state array as a `.json` file.

## 6. Implementation Steps
1.  **Setup:** Configure Vite for MP (Multi-Page) app to include `Table_Conn_index.html`.
2.  **Dependencies:** `npm install react-xarrows papaparse`.
3.  **Core Components:** Build Table, Node, and Log components.
4.  **Logic Integration:** Implement selection handler, Space key listener, and Connection manager.
5.  **Visualization:** Integrate `react-xarrows` for the "Connect" phase.
6.  **Refinement:** Add Context Menu, JSON Export, and Styling.
7.  **Verification:** Test flow from CSV load to Export.
