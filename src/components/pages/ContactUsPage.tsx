import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Clock, Globe } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const { setCurrentPage } = useGame();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Game Feedback & Suggestions');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleBack = () => {
    setCurrentPage('home');
    soundFx.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    soundFx.playVictory();
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Back Button */}
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Home
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 overflow-hidden backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-extrabold uppercase tracking-widest">
            <MessageSquare className="w-4 h-4" /> Get In Touch
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Contact Us</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
            Have a game you want us to add? Encountered a bug? Want to partner or advertise? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Mail className="w-4 h-4" /> Direct Support Email
            </div>
            <p className="text-xs text-slate-400">For inquiries, game additions, and copyright notices:</p>
            <span className="text-xs font-mono font-bold text-cyan-300">support@gamers-time.online</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Clock className="w-4 h-4" /> Response Time
            </div>
            <p className="text-xs text-slate-400">Our gaming support team reviews messages 7 days a week, typically responding within 24 to 48 hours.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Globe className="w-4 h-4" /> Game Submissions
            </div>
            <p className="text-xs text-slate-400">Are you an indie game developer? Include your Playgama, Itch.io, or HTML5 game links to be featured!</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 backdrop-blur shadow-xl">
          {submitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Message Dispatched!</h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-md">
                Thank you, <strong className="text-slate-200">{name}</strong>. Your transmission has been sent to our moderators. We will reach back out to you at <span className="text-cyan-400 font-mono">{email}</span>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" /> Send Transmission
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Name / Gamer Tag</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. CyberKnight"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. gamer@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Subject Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 outline-none transition cursor-pointer"
                >
                  <option value="Game Feedback & Suggestions">Game Feedback & Suggestions</option>
                  <option value="Report a Broken Game / Bug">Report a Broken Game / Bug</option>
                  <option value="Submit a New Game">Submit a New Game</option>
                  <option value="DMCA / Copyright Inquiries">DMCA / Copyright Inquiries</option>
                  <option value="Partnerships & Advertising">Partnerships & Advertising</option>
                  <option value="Other Question">Other Question</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your request or thoughts in detail..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl p-3.5 outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4" /> Transmit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
