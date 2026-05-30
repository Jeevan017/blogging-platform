import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PageFallback from './components/common/PageFallback.jsx';
import Footer from './components/layout/Footer.jsx';
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const SinglePost = lazy(() => import('./pages/SinglePost.jsx'));
const CreatePost = lazy(() => import('./pages/CreatePost.jsx'));
const EditPost = lazy(() => import('./pages/EditPost.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const EditProfile = lazy(() => import('./pages/EditProfile.jsx'));
const ChangePassword = lazy(() => import('./pages/ChangePassword.jsx'));
const SearchUsers = lazy(() => import('./pages/SearchUsers.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <div className="container">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post/:id" element={<SinglePost />} />
              <Route path="/users" element={<SearchUsers />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile/:id" element={<Profile />} />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
