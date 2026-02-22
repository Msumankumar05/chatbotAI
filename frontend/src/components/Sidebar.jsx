import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  History, 
  Settings, 
  Plus,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Code,
  BookOpen,
  User,
  LogOut,
  ChevronDown,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
  const [mode, setMode] = useState('exam');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState({
    name: 'M Suman Kumar',
    email: 'ms.@example.com',
    avatar: 'JD',
    plan: 'Free',
    usage: 45,
    usageLimit: 100
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/histories');
      setChats(response.data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const createNewChat = () => {
    navigate('/');
    toast.success('New chat created');
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // Add your logout logic here
  };

  const modes = [
    { id: 'exam', label: 'Exam Focus', icon: GraduationCap, color: 'text-primary-400' },
    { id: 'coding', label: 'Coding Mentor', icon: Code, color: 'text-green-400' },
    { id: 'syllabus', label: 'Syllabus Mode', icon: BookOpen, color: 'text-purple-400' },
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const accountMenuVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: { opacity: 1, height: 'auto', y: 0 }
  };

  return (
    <motion.aside
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-screen glass-card flex flex-col overflow-hidden"
    >
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-dark-card border border-dark-border rounded-full p-1 hover:bg-dark-border transition-colors z-10"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.div>
      </motion.button>

      {/* Logo */}
      <motion.div 
        className={cn(
          "p-4 border-b border-dark-border",
          isCollapsed ? "text-center" : ""
        )}
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.h1 
          className={cn(
            "font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent",
            isCollapsed ? "text-xl" : "text-2xl"
          )}
          layout
        >
          {isCollapsed ? "M" : "MentorAI"}
        </motion.h1>
      </motion.div>

      {/* New Chat Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={createNewChat}
        className="mx-2 mt-4 p-3 glass-card hover:bg-dark-border/50 transition-all flex items-center gap-3 group"
        layout
      >
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Plus size={20} className="text-primary-400" />
        </motion.div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm whitespace-nowrap"
            >
              New Chat
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mode Selector */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className="px-2 mt-4 space-y-1"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {modes.map((m) => {
              const IconComponent = m.icon;
              return (
                <motion.button
                  key={m.id}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "w-full p-2 rounded-lg flex items-center gap-3 transition-all",
                    mode === m.id 
                      ? "bg-primary-600/20 text-primary-400 border border-primary-500/30" 
                      : "hover:bg-dark-border/50 text-dark-muted"
                  )}
                >
                  <IconComponent size={18} className={m.color} />
                  <span className="text-sm">{m.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat History */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className="flex-1 overflow-y-auto mt-4 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2 px-2">
              Recent Chats
            </h3>
            <div className="space-y-1">
              <AnimatePresence>
                {chats.slice(0, 5).map((chat, index) => (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/chat/${chat._id}`}
                      className="block"
                    >
                      <motion.div
                        whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          location.pathname.includes(chat._id) && "bg-dark-border/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare size={16} className="text-dark-muted" />
                          <span className="text-sm truncate">{chat.title}</span>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Account & Settings */}
      <motion.div 
        className="border-t border-dark-border mt-auto"
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Account Section */}
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2"
            >
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="w-full p-2 rounded-lg flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.avatar}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-dark-muted">{user.plan} Plan</p>
                </div>
                <motion.div
                  animate={{ rotate: isAccountOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={16} className="text-dark-muted" />
                </motion.div>
              </motion.button>

              {/* Account Dropdown Menu */}
              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    variants={accountMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-1 pl-11">
                      {/* Usage Bar */}
                      <div className="py-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-dark-muted">Daily usage</span>
                          <span className="text-primary-400">{user.usage}/{user.usageLimit}</span>
                        </div>
                        <div className="h-1 bg-dark-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(user.usage / user.usageLimit) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ x: 5 }}
                        className="w-full p-2 rounded-lg hover:bg-dark-border/50 transition-all flex items-center gap-3 text-sm"
                      >
                        <User size={16} className="text-dark-muted" />
                        <span>Profile</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 5 }}
                        className="w-full p-2 rounded-lg hover:bg-dark-border/50 transition-all flex items-center gap-3 text-sm"
                      >
                        <CreditCard size={16} className="text-dark-muted" />
                        <span>Billing</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 5 }}
                        className="w-full p-2 rounded-lg hover:bg-dark-border/50 transition-all flex items-center gap-3 text-sm"
                      >
                        <HelpCircle size={16} className="text-dark-muted" />
                        <span>Help & Support</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={handleLogout}
                        className="w-full p-2 rounded-lg hover:bg-red-500/20 transition-all flex items-center gap-3 text-sm text-red-400"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-2 flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-center text-white font-semibold"
                title="Account"
              >
                {user.avatar}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Link */}
        <motion.div 
          className={cn(
            "p-2",
            isCollapsed ? "text-center" : ""
          )}
          layout
        >
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-dark-border/50 transition-all",
              location.pathname === '/settings' && "bg-dark-border/30"
            )}
          >
            <motion.div
              whileHover={{ rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={18} className="text-dark-muted" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        {/* History Link */}
        <motion.div 
          className={cn(
            "p-2 pt-0",
            isCollapsed ? "text-center" : ""
          )}
          layout
        >
          <Link
            to="/history"
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-dark-border/50 transition-all",
              location.pathname === '/history' && "bg-dark-border/30"
            )}
          >
            <History size={18} className="text-dark-muted" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm whitespace-nowrap"
                >
                  History
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;