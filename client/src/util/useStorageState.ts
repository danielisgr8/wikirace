import { useState, useEffect } from "react";

const useStorageState = <T>(name: string, initialState: T, storageCondition = true): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState(() => {
    const item = localStorage.getItem(name);
    if(item !== null && storageCondition) {
      return JSON.parse(item) as T;
    } else {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(name, JSON.stringify(state));
  }, [name, state]);

  return [state, setState];
};

export default useStorageState;
