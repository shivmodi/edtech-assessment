import { Provider } from 'react-redux';
import { store } from './store';
import BoardPage from './pages/Board';

export default function App() {
  return (
    <Provider store={store}>
      <BoardPage />
    </Provider>
  );
}