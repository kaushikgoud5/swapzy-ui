import { NavigationBar } from "../../components/NavigationBar";
import { Sidebar } from "../../components/Sidebar";
import { ScrollToTop } from "../../components/ScrollToTop";
import { Routes, Route, Navigate } from "react-router-dom";
import { DiscoveryPage } from "./DiscoveryPage";
import { ProfileCreationPage } from "./ProfileCreationPage";
import { ChatPage } from "./ChatPage";
import { ChatThread } from "./ChatThread";
import { MyListingsPage } from "./MyListingsPage";
import { CreateListingPage } from "./CreateListingPage";
import { NotificationsPage } from "./NotificationsPage";

function Home() {
  return (
    <div>
      <Sidebar />

      <div className="relative z-10 pb-20 md:pb-0 md:ml-[72px]">
        <Routes>
          <Route index element={<Navigate to="discover" replace />} />
          <Route path="discover" element={<DiscoveryPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:matchId" element={<ChatThread />} />
          <Route path="profile" element={<ProfileCreationPage />} />
          <Route path="sell" element={<MyListingsPage />} />
          <Route path="create-listing" element={<CreateListingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Routes>
      </div>

      <ScrollToTop />
      <NavigationBar />
    </div>
  );
}

export default Home;
