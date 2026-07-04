import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ onLogout }) {
  const [articleLink, setArticleLink] = useState('');
  const [result, setResult] = useState(null);
  const [topNews, setTopNews] = useState([]);
  const [isLoadingTopNews, setIsLoadingTopNews] = useState(true);
  const [topNewsError, setTopNewsError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!articleLink.trim()) {
      setResult({ type: 'error', message: 'Please paste an article text to verify.', isFake: null });
      return;
    }

    setResult({ type: 'loading', message: 'Verifying... Please wait.', isFake: null });

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: articleLink }),
      });

      if (response.status === 401) {
        if (onLogout) {
          await onLogout();
        }
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        const prediction = data.prediction;
        const isFake = prediction === 'Fake';
        setResult({
          type: isFake ? 'fake' : 'success',
          message: `Prediction: ${prediction}`,
          isFake,
        });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Server error occurred during prediction.',
          isFake: null,
        });
      }
    } catch (error) {
      console.error('Network Error:', error);
      setResult({
        type: 'error',
        message: 'Failed to connect to the server. Check your Flask server.',
        isFake: null,
      });
    }
  };

  const handleLogoutClick = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/Login');
  };

  const fetchTopNews = async () => {
    setIsLoadingTopNews(true);
    setTopNewsError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/top-news-analysis?limit=10&query=India');
      const data = await response.json();

      if (!response.ok) {
        setTopNewsError(data.error || 'Unable to load top news right now.');
        setTopNews([]);
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      setTopNews(items);
    } catch (error) {
      console.error('Error fetching news:', error);
      setTopNewsError('Failed to fetch top news. Please check backend connection.');
      setTopNews([]);
    } finally {
      setIsLoadingTopNews(false);
    }
  };

  useEffect(() => {
    fetchTopNews();
  }, []);

  const badgeClassesByPrediction = (isFake) =>
    isFake
      ? 'bg-error-container text-on-error-container'
      : 'bg-tertiary-container text-on-tertiary-container';

  const labelByPrediction = (isFake) => (isFake ? 'AI Flagged: Fake' : 'Verified Real');

  const iconByPrediction = (isFake) => (isFake ? 'report' : 'verified');

  const cardOutlineByPrediction = (isFake) =>
    isFake ? 'border-l-4 border-error' : 'border-l-4 border-tertiary-fixed';

  const resultBadgeClass =
    result?.type === 'fake'
      ? 'bg-error-container text-on-error-container'
      : 'bg-tertiary-container text-on-tertiary-container';

  const resultCircleClass =
    result?.type === 'fake'
      ? 'bg-error text-on-error'
      : 'bg-tertiary-container text-on-tertiary-container';

  const resultCardBorderClass = result?.type === 'fake' ? 'border-error' : 'border-tertiary-fixed';

  const resultLabel =
    result?.type === 'loading'
      ? 'Analyzing'
      : result?.type === 'error'
      ? 'Analysis Error'
      : result?.type === 'fake'
      ? 'AI Flagged: Fake'
      : 'Verified Real';

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-primary min-h-screen">
      <nav className="bg-[#f7f9fb]/80 backdrop-blur-lg fixed top-0 z-50 w-full shadow-none">
        <div className="flex justify-between items-center w-full px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
          <div className="text-2xl font-black text-[#091426] tracking-tighter">TruthCheck</div>
          <div className="hidden md:flex gap-8 items-center font-headline font-semibold tracking-tight">
            <a className="text-[#091426] border-b-2 border-[#091426] pb-1" href="#">Home</a>
            <a className="text-slate-500 hover:text-[#091426] transition-colors" href="#live-feed">Live Feed</a>
            <a className="text-slate-500 hover:text-[#091426] transition-colors" href="#about">About</a>
          </div>
          <button
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold hover:opacity-80 transition-opacity active:scale-95 duration-200"
            onClick={handleLogoutClick}
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative min-h-[870px] flex items-center justify-center overflow-hidden px-6 py-20" id="about">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary-fixed/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-tertiary-fixed/20 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-primary leading-[1.05]">
                Separate Fact <br />
                <span className="text-secondary-container">from Fiction</span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-2xl mx-auto font-medium">
                Using advanced neural networks to verify digital information. Enter any news URL or claim to reveal the underlying truth.
              </p>
            </div>

            <form
              className="max-w-3xl mx-auto glass-card p-4 rounded-2xl shadow-xl shadow-primary/5 flex flex-col md:flex-row gap-3"
              onSubmit={handleSubmit}
            >
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">link</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-primary font-medium"
                  placeholder="Paste article text here..."
                  type="text"
                  value={articleLink}
                  onChange={(e) => setArticleLink(e.target.value)}
                />
              </div>
              <button
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
                type="submit"
              >
                Verify Article
                <span className="material-symbols-outlined">search_check</span>
              </button>
            </form>

            <div className="max-w-lg mx-auto transform translate-y-4 md:translate-y-8">
              <div className={`bg-surface-container-lowest p-6 rounded-2xl shadow-lg border-l-4 ${resultCardBorderClass} flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300 gap-4`}>
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${resultCircleClass}`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {result?.type === 'fake' ? 'error' : 'verified'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{result ? 'Analysis Complete' : 'Awaiting Analysis'}</h4>
                    <p className="text-sm text-on-surface-variant font-medium">
                      {result?.message || 'Submit an article to see the verdict'}
                    </p>
                  </div>
                </div>
                <div className={`${resultBadgeClass} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {result?.type === 'fake' ? 'report' : 'verified'}
                  </span>
                  {resultLabel}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-24 px-6 md:px-12" id="live-feed">
          <div className="max-w-[1440px] mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-secondary-container font-bold tracking-widest text-xs uppercase">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                  Live Now
                </div>
                <h2 className="text-4xl font-extrabold text-primary tracking-tight">Live India News Analysis</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-95"
                  onClick={fetchTopNews}
                >
                  Today's Top 10 India
                </button>
              </div>
            </div>

            {isLoadingTopNews && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
                <div className="md:col-span-8 h-[320px] bg-surface-container-lowest rounded-2xl" />
                <div className="md:col-span-4 h-[320px] bg-surface-container-lowest rounded-2xl" />
                <div className="md:col-span-4 h-52 bg-surface-container-lowest rounded-2xl" />
                <div className="md:col-span-4 h-52 bg-surface-container-lowest rounded-2xl" />
                <div className="md:col-span-4 h-52 bg-surface-container-lowest rounded-2xl" />
              </div>
            )}

            {!isLoadingTopNews && topNewsError && (
              <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 font-medium">
                {topNewsError}
              </div>
            )}

            {!isLoadingTopNews && !topNewsError && topNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className={`md:col-span-8 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group ${cardOutlineByPrediction(topNews[0].prediction === 'Fake')}`}>
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/2 relative overflow-hidden min-h-[280px] flex items-center justify-center bg-gradient-to-br from-[#dde3ef] to-[#cfd9ea]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
                      <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center ${topNews[0].prediction === 'Fake' ? 'bg-error text-on-error' : 'bg-secondary-container text-on-secondary'}`}>
                        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          newspaper
                        </span>
                      </div>
                      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${badgeClassesByPrediction(topNews[0].prediction === 'Fake')}`}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{iconByPrediction(topNews[0].prediction === 'Fake')}</span>
                        {labelByPrediction(topNews[0].prediction === 'Fake')}
                      </div>
                    </div>

                    <div className="md:w-1/2 p-8 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-tighter">
                          <span className="material-symbols-outlined text-base">domain</span>
                          {(topNews[0].source || 'Reliable Source').toUpperCase()}
                        </div>
                        <h3 className="text-3xl font-bold leading-tight text-primary">{topNews[0].title}</h3>
                        <p className="text-sm text-on-surface-variant line-clamp-3">
                          Auto analyzed by TruthCheck AI using live trusted-feed headline signals.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-on-tertiary-container">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">newspaper</span>
                          </div>
                          <span className="text-sm font-bold text-primary">Top Trusted Headline</span>
                        </div>
                        <a
                          className="text-primary font-bold text-sm underline hover:text-secondary-container transition-colors"
                          href={topNews[0].link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Read Analysis
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {topNews[1] && (() => {
                  const isFake = topNews[1].prediction === 'Fake';
                  return (
                    <div className={`md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all ${cardOutlineByPrediction(isFake)}`}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${badgeClassesByPrediction(isFake)}`}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {iconByPrediction(isFake)}
                            </span>
                            {labelByPrediction(isFake)}
                          </div>
                          <a href={topNews[1].link} rel="noreferrer" target="_blank" className="material-symbols-outlined text-on-surface-variant">open_in_new</a>
                        </div>
                        <h3 className="text-xl font-bold text-primary leading-tight">{topNews[1].title}</h3>
                        <p className="text-sm text-on-surface-variant">{topNews[1].source || 'Reliable Source'}</p>
                      </div>
                      <div className="pt-6 mt-6 border-t border-outline-variant/10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold">TC</div>
                        <span className="text-xs font-medium text-on-surface-variant">Auto checked by TruthCheck AI</span>
                      </div>
                    </div>
                  );
                })()}

                {topNews.slice(2, 10).map((news, index) => {
                  const isFake = news.prediction === 'Fake';
                  return (
                    <div
                      className={`md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col gap-4 ${cardOutlineByPrediction(isFake)}`}
                      key={`${news.title}-${index}`}
                    >
                      <div className="h-40 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#dde3ef] to-[#cfd9ea]">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isFake ? 'bg-error text-on-error' : 'bg-secondary-container text-on-secondary'}`}>
                          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>newspaper</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className={`px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 uppercase tracking-tighter ${badgeClassesByPrediction(isFake)}`}>
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {iconByPrediction(isFake)}
                          </span>
                          {labelByPrediction(isFake)}
                        </div>
                        <h4 className="font-bold text-primary leading-tight line-clamp-3">{news.title}</h4>
                        <p className="text-xs text-on-surface-variant line-clamp-2">{news.source || 'Reliable Source'}</p>
                        <a
                          className="text-xs font-semibold text-secondary-container hover:underline"
                          href={news.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open Source Article
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-[#031126] via-[#041b3a] to-[#031126] py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 gap-6 max-w-[1440px] mx-auto">
          <div className="text-lg font-bold text-on-primary">TruthCheck</div>
          <div className="flex gap-8 font-body text-sm uppercase tracking-widest text-primary-fixed-dim">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors" href="#">AI Methodology</a>
          </div>
          <div className="font-body text-sm uppercase tracking-widest text-primary-fixed-dim">© 2026 TruthCheck AI. The Digital Curator.</div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
