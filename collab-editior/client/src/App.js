import { Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import TextEditor from './textEditor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/document/${uuidv4()}`}  />} />
      <Route path="/document/:id" element={<TextEditor />} />
    </Routes>
  );
}

export default App;

