
import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [img, setImg] = useState([]);

  useEffect(() => {
    // An HTTP GET request is made to get the data of the images
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => setImg(data));
  }, []);

  const addMoveable = () => {
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
// Add a new Moveable component with random initial values to the component list
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  const removeMoveable = (id) => {
    // Remove a Moveable component from the component
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== id
    );
    setMoveableComponents(updatedMoveables);
    if (selected === id) {
      setSelected(null);
    }
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    // Update a Moveable component with new values
    const updatedMoveables = moveableComponents.map((moveable) =>
      moveable.id === id ? { id, ...newComponent, updateEnd } : moveable
    );
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    const [handlePosX] = e.direction;

    if (handlePosX === -1) {
      const initialLeft = e.left;
      const initialWidth = e.width;

  // Set the onResize event to update the left position based on the width change
      e.onResize = ({ width }) => {
        const deltaWidth = width - initialWidth;
        const newLeft = initialLeft - deltaWidth;
        updateMoveable(e.target.id, { left: newLeft, width }, false);
      };
    }
  };

  const parentRef = useRef(null); 
  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button  onClick={addMoveable}>Add Moveable</button>
      <div
        id="parent"
        ref={parentRef}
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "90vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            index={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            removeMoveable={removeMoveable}
            img={img[index % img.length]}
            parentRef={parentRef} 
          />
        ))}
      </div>
    </main>
  );
};

const Component = ({
  id,
  top,
  left,
  width,
  height,
  color,
  updateMoveable,
  handleResizeStart,
  setSelected,
  isSelected,
  removeMoveable,
  img,
  parentRef,
}) => {
  const ref = useRef();
  const moveableRef = useRef();

  useEffect(() => {
    // Update the Moveable component when values change
    moveableRef.current.updateRect();
  }, [top, left, width, height]);

  const onResize = (e) => {
    const { width, height } = e;
    updateMoveable(id, { top, left, width, height });
  };

  const onResizeEnd = () => {
    updateMoveable(id, { top, left, width, height }, true);
  };

  return (
    <>
      <div
        ref={ref}
        className={`draggable ${isSelected ? "selected" : ""}`}
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      >
        <img
          src={img?.thumbnailUrl}
          alt={img?.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button className="delete" onClick={() => removeMoveable(id)}>
          Delete
        </button>
      </div>

      <Moveable
        ref={moveableRef}
        target={ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeStart={(e) => handleResizeStart(id, e)}
        onResizeEnd={onResizeEnd}
        onDragEnd={() =>
          updateMoveable(id, { top, left, width, height, color }, true)
        }
        // reference to the parent container
        parent={parentRef.current} 
        origin={false}
        keepRatio={false}
        edge={false}
        throttleResize={0}
        throttleDrag={0}
        // Includes all resize points
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]} 
        rotatable={false}
        snappable={true}
        snappers={[
          ({ left, top, right, bottom }) => [
            Math.round(left),
            Math.round(top),
            Math.round(right),
            Math.round(bottom),
          ],
        ]}
        snappableRadius={10}
        snapCenter={true}
        snapVertical={true}
        snapHorizontal={true}
        onRenderEnd={() =>
          updateMoveable(id, { top, left, width, height, color }, true)
        }
        bounds={{ left: 0, top: 0, right: parentRef.current.offsetWidth , bottom: parentRef.current.offsetHeight }}
       
      />
    </>
  );
};

export default App;
