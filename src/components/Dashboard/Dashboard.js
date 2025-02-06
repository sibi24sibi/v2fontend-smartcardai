import { useEffect, useState } from "react";
import "./styles.css";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Share from "./../../hooks/ShareButton";
import { useUser } from "../../context/UserContext";

export default function Dashboard() {
  const widgetsData = {
    widgets: [
      {
        cardNumber: 1,
        type: "scorecard",
        width: 4,
        height: 2,
        position: { x: 0, y: 0 },
        html: "<h2>Scorecard</h2><p>Score: 95%</p>",
      },
      {
        cardNumber: 2,
        type: "graph",
        width: 6,
        height: 4,
        position: { x: 4, y: 0 },
        html: "<h2>Graph</h2><svg width='100%' height='100%'><line x1='10' y1='90' x2='90' y2='10' stroke='blue' stroke-width='2'/></svg>",
      },
      {
        cardNumber: 3,
        type: "table",
        width: 8,
        height: 6,
        position: { x: 0, y: 2 },
        html: "<h2>Table</h2><table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr><tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr></table>",
      },
      {
        cardNumber: 4,
        type: "map",
        width: 6,
        height: 4,
        position: { x: 8, y: 0 },
        html: "<h2>Map</h2><img src='https://via.placeholder.com/150x100' alt='Map' style='width:100%;height:80%;'/>",
      },
      {
        cardNumber: 5,
        type: "funnel",
        width: 6,
        height: 4,
        position: { x: 6, y: 6 },
        html: "<h2>Funnel</h2><svg width='100%' height='100%'><polygon points='10,10 90,10 50,90' style='fill:orange;stroke:black;stroke-width:1'/></svg>",
      },
    ],
  };

  const [widgets, setWidgets] = useState([
    {
      cardNumber: 1,
      type: "scorecard",
      width: 4,
      height: 2,
      position: { x: 0, y: 0 },
      html: "<h2>Scorecard</h2><p>Score: 95%</p>",
    },
    {
      cardNumber: 2,
      type: "graph",
      width: 6,
      height: 4,
      position: { x: 4, y: 0 },
      html: "<h2>Graph</h2><svg width='100%' height='100%'><line x1='10' y1='90' x2='90' y2='10' stroke='blue' stroke-width='2'/></svg>",
    },
    {
      cardNumber: 3,
      type: "table",
      width: 8,
      height: 6,
      position: { x: 0, y: 2 },
      html: "<h2>Table</h2><table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr><tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr></table>",
    },
    {
      cardNumber: 4,
      type: "map",
      width: 6,
      height: 4,
      position: { x: 8, y: 0 },
      html: "<h2>Map</h2><img src='https://via.placeholder.com/150x100' alt='Map' style='width:100%;height:80%;'/>",
    },
    {
      cardNumber: 5,
      type: "funnel",
      width: 6,
      height: 4,
      position: { x: 6, y: 6 },
      html: "<h2>Funnel</h2><svg width='100%' height='100%'><polygon points='10,10 90,10 50,90' style='fill:orange;stroke:black;stroke-width:1'/></svg>",
    },
  ]);
  const [isEditing, setIsEditing] = useState(false); // Track edit/save state
  const [uuid, setUuid] = useState("");
  const [resizing, setIsResizing] = useState(false); // Track if resizing is happening
  const { dashboardItems, setDashboardItems } = useUser();
  const [dataItem, setDataItem] = useState({});
  const { name: folderId } = useParams();

  const navigate = useNavigate();

  const user_name = "user1";

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/dashboards?username=${user_name}`
        );
        const data = await response.json();

        const folders = Object.values(data.dashboards);
        console.log(dataItem);

        if (data.success) {
          const filteredData = folderId
            ? folders.filter((folder) => folder.dashboards_id === folderId)
            : folders; // If no folderId, use all the folders

          setDataItem(filteredData);
          setDataItem(filteredData[0] || []);
        } else {
          console.log("Error fetching dashboards", data.message);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    if (user_name) {
      fetchDashboards();
    }
  }, [user_name, dataItem]); // Re-fetch if user_name changes

  // Handle the resizing logic
  const handleResize = (index, newWidth, newHeight) => {
    const updatedWidgets = [...widgets];
    updatedWidgets[index].width = Math.max(newWidth, 100); // Set a minimum width of 100
    updatedWidgets[index].height = Math.max(newHeight, 100); // Set a minimum height of 100
    setWidgets(updatedWidgets);
    saveToJSON(updatedWidgets); // Update the data.json after resize
  };

  const handleDragStart = (index, e) => {
    if (resizing) return; // Prevent drag if resizing is in progress
    const initialX = e.clientX;
    const initialY = e.clientY;

    // Store the initial widget position
    const initialWidgetPosition = { ...widgets[index].position };

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - initialX;
      const deltaY = moveEvent.clientY - initialY;

      const newX = initialWidgetPosition.x + deltaX;
      const newY = initialWidgetPosition.y + deltaY;

      handleDrag(index, newX, newY); // Update position during dragging
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      saveToJSON(widgets); // Save final widget position
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Handle widget repositioning (dragging logic)
  const handleDrag = (index, newX, newY) => {
    const updatedWidgets = [...widgets];
    updatedWidgets[index].position.x = newX;
    updatedWidgets[index].position.y = newY;

    setWidgets(updatedWidgets);
    saveToJSON(updatedWidgets); // Update the data.json after drag
  };

  // Function to save updated data to JSON (simulated as localStorage)
  const saveToJSON = (updatedWidgets) => {
    const widgetDataToSave = updatedWidgets.map((widget) => ({
      cardNumber: widget.cardNumber,
      width: widget.width,
      height: widget.height,
      position: widget.position,
    }));

    localStorage.setItem(
      "widgetsData",
      JSON.stringify({ widgets: widgetDataToSave })
    );
  };

  // Load saved widgets data from localStorage if available
  useEffect(() => {
    const savedWidgets = JSON.parse(localStorage.getItem("widgetsData"));
    if (savedWidgets) {
      setWidgets(savedWidgets.widgets);
    }
  }, []);

  // Render HTML content from widget's HTML string
  const renderHTML = (htmlString) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  const baseUrl = window.location.origin;

  return (
    <div>
      <h1>Dashboard: {dataItem.dashboard_name}</h1>

      {/* Toggle button */}
      <button
        className={`save-button ${isEditing ? "edit" : "save"}`}
        onClick={toggleEditMode}
      >
        {isEditing ? "Save" : "Edit"}
      </button>
      <Share
        label="Share"
        title="My Web Share Adventures"
        text="Hello World! I shared this content via Web Share"
        shareUrl={`${baseUrl}/shared-dashboard/${uuid}`} // Share the dynamic URL
        style={{ marginLeft: "10px" }}
      />
      <div
        style={{
          position: "relative",
          width: "calc(100vw - 240px)",
          height: "calc(100vh - 60px)",
          paddingTop: "60px",
          paddingLeft: "240px",
          boxSizing: "border-box",
          overflowX: "auto", // Enable horizontal scrolling if needed
          overflowY: "auto", // Enable vertical scrolling if needed
          zIndex: 0,
        }}
        className="dashboard"
      >
        {widgets.map((widget, index) => (
          <div
            key={widget.cardNumber}
            className="widget"
            style={{
              left: `${widget.position.x}px`,
              top: `${widget.position.y}px`,
              width: `${widget.width}px`,
              height: `${widget.height}px`,
              cursor: isEditing && !resizing ? "move" : "default", // Only show move cursor if not resizing
            }}
            onMouseDown={(e) => {
              if (isEditing && !resizing) {
                handleDragStart(index, e); // Start dragging only if not resizing
              }
            }}
          >
            {isEditing && (
              <div
                className="widget-resize-handle"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true); // Mark resizing as true
                  const initialWidth = widget.width;
                  const initialHeight = widget.height;
                  const initialX = e.clientX;
                  const initialY = e.clientY;

                  const onMouseMove = (moveEvent) => {
                    const newWidth =
                      initialWidth + (moveEvent.clientX - initialX);
                    const newHeight =
                      initialHeight + (moveEvent.clientY - initialY);
                    handleResize(index, newWidth, newHeight);
                  };

                  const onMouseUp = () => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    saveToJSON(widgets);
                    setIsResizing(false); // Mark resizing as false when done
                  };

                  document.addEventListener("mousemove", onMouseMove);
                  document.addEventListener("mouseup", onMouseUp);
                }}
              ></div>
            )}

            <div className="widget-values">
              <p>Card Number: {widget.cardNumber}</p>
              <p>Type: {widget.type}</p>
              <p>Width: {widget.width}</p>
              <p>Height: {widget.height}</p>
              <p>
                Position: X: {widget.position.x}, Y: {widget.position.y}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
