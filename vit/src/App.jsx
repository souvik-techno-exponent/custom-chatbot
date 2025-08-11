import ChatWidget from './ChatWidget';
import BotsList from './pages/BotsList';
import CreateBot from './pages/CreateBot';

export default function App() {
  const path = window.location.pathname;
  if (path.startsWith('/admin/create')) return <CreateBot />;
  if (path.startsWith('/admin')) return <BotsList />;
  return <ChatWidget />;
}
