import { createContext, useState } from "react";
import { createPortal } from "react-dom";

export type Coords = {
  top: number;
  left: number;
};

export type DndContextType = {
  isDragging: boolean;
  startCoords: Coords;
  endCoords: Coords;
  setIsDragging: () => void;
  setIsDropping: () => void;
  setStartCoords: (coords: Coords) => void;
  setEndCoords: (coords: Coords) => void;
  setContainerCoords: (coords: Coords) => void;
};

export const DndContext = createContext<DndContextType>({} as DndContextType);

export const DndProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDragging, _setIsDragging] = useState(false);
  const [startCoords, _setStartCoords] = useState<Coords>({ top: 0, left: 0 });
  const [endCoords, _setEndCoords] = useState<Coords>({ top: 0, left: 0 });
  const [containerCoords, _setContainerCoords] = useState<Coords>({
    top: 0,
    left: 0,
  });

  const setIsDragging = () => {
    _setIsDragging(true);
  };

  const setIsDropping = () => {
    _setIsDragging(false);
  };

  const setStartCoords = (coords: Coords) => {
    _setStartCoords({
      top: coords.top - containerCoords.top,
      left: coords.left - containerCoords.left,
    });
  };

  const setEndCoords = (coords: Coords) => {
    _setEndCoords({
      top: coords.top - containerCoords.top,
      left: coords.left - containerCoords.left,
    });
  };

  const setContainerCoords = (coords: Coords) => {
    _setContainerCoords(coords);
  };

  return (
    <DndContext.Provider
      value={{
        isDragging,
        startCoords,
        endCoords,
        setIsDragging,
        setIsDropping,
        setStartCoords,
        setEndCoords,
        setContainerCoords,
      }}
    >
      <>{children}</>
      {/* debugger */}
      {createPortal(
        <div className="flex absolute top-0 right-0 bg-gray-100 p-2 text-sm gap-1 overflow-y-scroll">
          <div>
            <h5>正在拖动:</h5>
            {isDragging ? "是" : "否"}
          </div>
          <div>
            <h5>开始坐标:</h5>
            <pre>{JSON.stringify(startCoords, null, 2)}</pre>
          </div>
          <div>
            <h5>结束坐标:</h5>
            <pre>{JSON.stringify(endCoords, null, 2)}</pre>
          </div>
        </div>,
        document.body
      )}
    </DndContext.Provider>
  );
};
