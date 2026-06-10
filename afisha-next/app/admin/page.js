'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [subscribers, setSubscribers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: '', country: '', text: '', rating: 5 });
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: 'Starter', restaurant: 'Brasserie', meal: 'Breakfast', price: '', desc: '', img: '' });
  const [menuFilter, setMenuFilter] = useState('all');
  const [mealFilter, setMealFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ name: '', size: '', img: '', desc: '' });
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', location: 'Hotel Afisha', desc: '', img: '' });

  const [teamMembers, setTeamMembers] = useState([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', role: '', bio: '', img: '' });

  const [vacancies, setVacancies] = useState([]);
  const [showVacancyForm, setShowVacancyForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [vacancyForm, setVacancyForm] = useState({ title: '', department: '', type: 'Full-time', desc: '', requirements: '', email: 'hr@hotelafisha.com' });

  const [offers, setOffers] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({ title: '', desc: '', discount: '', validUntil: '', img: '' });

  // Check auth on load
  useEffect(() => {
    fetch('/api/auth').then(r => {
      if (r.ok) { setAuthed(true); }
      setChecking(false);
    });
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setLoginError('Incorrect password');
      setPassword('');
    }
  };

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthed(false);
    setPassword('');
  };

  // Fetch data
  useEffect(() => {
    if (!authed) return;
    fetchData();
  }, [authed]);

  const fetchData = async () => {
    setLoading(true);
    const [mRes, sRes, rRes, eRes, rvRes, tRes, vRes, oRes] = await Promise.all([
      fetch('/api/menu'),
      fetch('/api/newsletter'),
      fetch('/api/rooms'),
      fetch('/api/events'),
      fetch('/api/reviews'),
      fetch('/api/team'),
      fetch('/api/vacancies'),
      fetch('/api/offers'),
    ]);
    const mData = await mRes.json();
    const sData = await sRes.json();
    const rData = await rRes.json();
    const eData = await eRes.json();
    const rvData = await rvRes.json();
    const tData = await tRes.json();
    const vData = await vRes.json();
    const oData = await oRes.json();
    setMenuItems(mData);
    setSubscribers(sData.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt)));
    setRooms(rData);
    setEvents(eData.sort((a, b) => new Date(a.date) - new Date(b.date)));
    setReviews(rvData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setTeamMembers(tData);
    setVacancies(vData);
    setOffers(oData);
    setLoading(false);
  };

  // Menu CRUD
  const openMenuForm = (item = null) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuForm({ name: item.name, category: item.category, restaurant: item.restaurant, meal: item.meal || 'Breakfast', price: item.price, desc: item.desc, img: item.img });
    } else {
      setEditingMenuItem(null);
      setMenuForm({ name: '', category: 'Starter', restaurant: 'Brasserie', meal: 'Breakfast', price: '', desc: '', img: '' });
    }
    setShowMenuForm(true);
  };

  const saveMenuItem = async () => {
    if (!menuForm.name || !menuForm.category) return;
    if (editingMenuItem) {
      await fetch(`/api/menu/${editingMenuItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(menuForm) });
    } else {
      await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(menuForm) });
    }
    setShowMenuForm(false);
    await fetchData();
  };

  const deleteMenuItem = async (id) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const filteredMenu = menuItems.filter(m => {
    if (menuFilter !== 'all' && m.restaurant !== menuFilter) return false;
    if (mealFilter !== 'all' && m.meal !== mealFilter) return false;
    return true;
  });

  // Room CRUD
  const openRoomForm = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({ name: room.name, size: String(room.size || room.price || ''), img: room.img, desc: room.desc });
    } else {
      setEditingRoom(null);
      setRoomForm({ name: '', size: '', img: '', desc: '' });
    }
    setShowRoomForm(true);
  };

  const saveRoom = async () => {
    if (!roomForm.name || !roomForm.size) return;
    if (editingRoom) {
      await fetch(`/api/rooms/${editingRoom.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...roomForm, size: Number(roomForm.size) }) });
    } else {
      await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...roomForm, size: Number(roomForm.size) }) });
    }
    setShowRoomForm(false);
    fetchData();
  };

  const deleteRoom = async (id) => {
    await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  // Event CRUD
  const openEventForm = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({ title: event.title, date: event.date, time: event.time, location: event.location, desc: event.desc, img: event.img });
    } else {
      setEditingEvent(null);
      setEventForm({ title: '', date: '', time: '', location: 'Hotel Afisha', desc: '', img: '' });
    }
    setShowEventForm(true);
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.date) return;
    if (editingEvent) {
      await fetch(`/api/events/${editingEvent.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventForm) });
    } else {
      await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventForm) });
    }
    setShowEventForm(false);
    fetchData();
  };

  const deleteEvent = async (id) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  // Review CRUD
  const openReviewForm = (review = null) => {
    if (review) {
      setEditingReview(review);
      setReviewForm({ name: review.name, country: review.country, text: review.text, rating: review.rating });
    } else {
      setEditingReview(null);
      setReviewForm({ name: '', country: '', text: '', rating: 5 });
    }
    setShowReviewForm(true);
  };

  const updateReviewStatus = async (id, status) => {
    await fetch(`/api/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    await fetchData();
  };

  const saveReview = async () => {
    if (!reviewForm.name || !reviewForm.text) return;
    if (editingReview) {
      await fetch(`/api/reviews/${editingReview.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewForm) });
    } else {
      await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...reviewForm, status: 'approved' }) });
    }
    setShowReviewForm(false);
    await fetchData();
  };

  const deleteReview = async (id) => {
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const deleteSubscriber = async (email) => {
    await fetch('/api/newsletter', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    await fetchData();
  };

  // Team CRUD
  const openTeamForm = (member = null) => {
    if (member) {
      setEditingTeam(member);
      setTeamForm({ name: member.name, role: member.role, bio: member.bio || '', img: member.img || '' });
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '', role: '', bio: '', img: '' });
    }
    setShowTeamForm(true);
  };

  const saveTeamMember = async () => {
    if (!teamForm.name || !teamForm.role) return;
    if (editingTeam) {
      await fetch(`/api/team/${editingTeam.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(teamForm) });
    } else {
      await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(teamForm) });
    }
    setShowTeamForm(false);
    fetchData();
  };

  const deleteTeamMember = async (id) => {
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  // Vacancy CRUD
  const openVacancyForm = (vacancy = null) => {
    if (vacancy) {
      setEditingVacancy(vacancy);
      setVacancyForm({ title: vacancy.title, department: vacancy.department || '', type: vacancy.type || 'Full-time', desc: vacancy.desc || '', requirements: vacancy.requirements || '', email: vacancy.email || 'hr@hotelafisha.com' });
    } else {
      setEditingVacancy(null);
      setVacancyForm({ title: '', department: '', type: 'Full-time', desc: '', requirements: '', email: 'hr@hotelafisha.com' });
    }
    setShowVacancyForm(true);
  };

  const saveVacancy = async () => {
    if (!vacancyForm.title) return;
    if (editingVacancy) {
      await fetch(`/api/vacancies/${editingVacancy.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vacancyForm) });
    } else {
      await fetch('/api/vacancies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vacancyForm) });
    }
    setShowVacancyForm(false);
    fetchData();
  };

  const deleteVacancy = async (id) => {
    await fetch(`/api/vacancies/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const toggleVacancyActive = async (id, active) => {
    await fetch(`/api/vacancies/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) });
    await fetchData();
  };

  // Offer CRUD
  const openOfferForm = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({ title: offer.title, desc: offer.desc || '', discount: offer.discount || '', validUntil: offer.validUntil || '', img: offer.img || '' });
    } else {
      setEditingOffer(null);
      setOfferForm({ title: '', desc: '', discount: '', validUntil: '', img: '' });
    }
    setShowOfferForm(true);
  };

  const saveOffer = async () => {
    if (!offerForm.title) return;
    if (editingOffer) {
      await fetch(`/api/offers/${editingOffer.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(offerForm) });
    } else {
      await fetch('/api/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(offerForm) });
    }
    setShowOfferForm(false);
    fetchData();
  };

  const deleteOffer = async (id) => {
    await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const toggleOfferActive = async (id, active) => {
    await fetch(`/api/offers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) });
    await fetchData();
  };

  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file, setter, field) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      setter(prev => ({ ...prev, [field]: data.url }));
    }
    setUploading(false);
  };

  const fmtDateTime = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Stats
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const menuByRestaurant = {};
  menuItems.forEach(m => { menuByRestaurant[m.restaurant] = (menuByRestaurant[m.restaurant] || 0) + 1; });

  // ── LOGIN SCREEN ──
  if (checking) {
    return (
      <div className={styles.page}>
        <div className={styles.loginWrap}>
          <p style={{ color: 'var(--taupe)' }}>Checking session...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className={styles.page}>
        <div className={styles.loginWrap}>
          <div className={styles.loginBox}>
            <img src="https://cdn.prod.website-files.com/669a26f7d42524ab776f6ebf/66f5b9c4bd8e0267ee3b80bf_Afisha_Logo_White.png" alt="Afisha" className={styles.loginLogo} />
            <h1 className={styles.loginTitle}>Admin Panel</h1>
            <p className={styles.loginSub}>Enter your password to continue</p>
            <form onSubmit={login}>
              <input
                type="password"
                className={`${styles.loginInput} ${loginError ? styles.inputError : ''}`}
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                placeholder="Password"
                autoFocus
              />
              {loginError && <p className={styles.loginErr}>{loginError}</p>}
              <button type="submit" className={styles.loginBtn}>
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ──
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="https://cdn.prod.website-files.com/669a26f7d42524ab776f6ebf/66f5b9c4bd8e0267ee3b80bf_Afisha_Logo_White.png" alt="Afisha" className={styles.headerLogo} />
          <span className={styles.badge}>Admin</span>
        </div>
        <div className={styles.headerRight}>
          <a href="/" className={styles.headerLink}>View Site</a>
          <button onClick={logout} className={styles.logoutBtn}>Sign Out</button>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles.nav}>
        {['dashboard', 'menu', 'rooms', 'events', 'team', 'vacancies', 'offers', 'reviews', 'subscribers'].map(t => (
          <button key={t} className={`${styles.navBtn} ${tab === t ? styles.navActive : ''}`} onClick={() => { setTab(t); setSelected(null); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className={styles.loadingMsg}>Loading data...</p>
      ) : (
        <>
          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && (
            <div className={styles.dashContent}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{menuItems.length}</span>
                  <span className={styles.statLabel}>Menu Items</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{rooms.length}</span>
                  <span className={styles.statLabel}>Rooms</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{events.length}</span>
                  <span className={styles.statLabel}>Events</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{reviews.length}</span>
                  <span className={styles.statLabel}>Reviews</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum} style={{ color: '#c9a96e' }}>{pendingReviews}</span>
                  <span className={styles.statLabel}>Pending Reviews</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{subscribers.length}</span>
                  <span className={styles.statLabel}>Subscribers</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{Object.keys(menuByRestaurant).length}</span>
                  <span className={styles.statLabel}>Restaurants</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{menuItems.filter(m => m.restaurant === 'Brasserie').length}</span>
                  <span className={styles.statLabel}>Brasserie Items</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{teamMembers.length}</span>
                  <span className={styles.statLabel}>Team Members</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{vacancies.length}</span>
                  <span className={styles.statLabel}>Vacancies</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{offers.length}</span>
                  <span className={styles.statLabel}>Offers</span>
                </div>
              </div>

              <div className={styles.dashGrid}>
                <div className={styles.dashPanel}>
                  <h3 className={styles.panelHead}>Menu by Restaurant</h3>
                  {Object.keys(menuByRestaurant).length === 0 ? (
                    <p className={styles.emptyMsg}>No menu items yet</p>
                  ) : (
                    <div className={styles.roomStats}>
                      {Object.entries(menuByRestaurant).sort((a, b) => b[1] - a[1]).map(([rest, count]) => (
                        <div key={rest} className={styles.roomStatRow}>
                          <span>{rest}</span>
                          <div className={styles.roomBar}>
                            <div className={styles.roomBarFill} style={{ width: `${(count / menuItems.length) * 100}%` }} />
                          </div>
                          <span className={styles.roomCount}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.dashPanel}>
                  <h3 className={styles.panelHead}>Recent Reviews</h3>
                  {reviews.length === 0 ? (
                    <p className={styles.emptyMsg}>No reviews yet</p>
                  ) : (
                    <div className={styles.recentList}>
                      {reviews.slice(0, 5).map(rv => (
                        <div key={rv.id} className={styles.recentItem} onClick={() => setTab('reviews')}>
                          <div>
                            <strong>{rv.name}</strong>
                            <span className={styles.recentSub}>{'★'.repeat(rv.rating)} — {rv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MENU TAB ── */}
          {tab === 'menu' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Menu ({filteredMenu.length})</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className={styles.filters}>
                      {['all', 'Breakfast', 'Lunch', 'Dinner'].map(f => (
                        <button key={f} className={`${styles.filterBtn} ${mealFilter === f ? styles.filterActive : ''}`} onClick={() => setMealFilter(f)}>
                          {f === 'all' ? 'All' : f}
                        </button>
                      ))}
                    </div>
                    <button className={styles.addBtn} onClick={() => openMenuForm()}>+ Add Item</button>
                  </div>
                </div>

                {showMenuForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Dish Name *</label>
                        <input value={menuForm.name} onChange={e => setMenuForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Khinkali" />
                      </div>
                      <div className={styles.formField}>
                        <label>Price</label>
                        <input value={menuForm.price} onChange={e => setMenuForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. ₾25" />
                      </div>
                      <div className={styles.formField}>
                        <label>Meal *</label>
                        <select value={menuForm.meal} onChange={e => setMenuForm(p => ({ ...p, meal: e.target.value }))}>
                          <option>Breakfast</option>
                          <option>Lunch</option>
                          <option>Dinner</option>
                        </select>
                      </div>
                      <div className={styles.formField}>
                        <label>Category *</label>
                        <select value={menuForm.category} onChange={e => setMenuForm(p => ({ ...p, category: e.target.value }))}>
                          <option>Starter</option>
                          <option>Main Course</option>
                          <option>Dessert</option>
                          <option>Drink</option>
                          <option>Wine</option>
                          <option>Cocktail</option>
                          <option>Snack</option>
                        </select>
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Image</label>
                        <div className={styles.imgUploadRow}>
                          <label className={styles.uploadBtn}>
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], setMenuForm, 'img')} />
                          </label>
                          <span className={styles.orText}>or</span>
                          <input value={menuForm.img} onChange={e => setMenuForm(p => ({ ...p, img: e.target.value }))} placeholder="Paste image URL..." style={{ flex: 1 }} />
                        </div>
                        {menuForm.img && <img src={menuForm.img} alt="Preview" className={styles.imgPreview} />}
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Description</label>
                        <textarea value={menuForm.desc} onChange={e => setMenuForm(p => ({ ...p, desc: e.target.value }))} placeholder="Dish description..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowMenuForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveMenuItem}>{editingMenuItem ? 'Update' : 'Add Item'}</button>
                    </div>
                  </div>
                )}

                {filteredMenu.length === 0 && !showMenuForm ? (
                  <p className={styles.emptyMsg}>No menu items yet. Click &quot;+ Add Item&quot; to create one.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Dish</th>
                        <th>Meal</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenu.map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                            {item.desc && <span className={styles.cellSub}>{item.desc.substring(0, 60)}{item.desc.length > 60 ? '...' : ''}</span>}
                          </td>
                          <td>{item.meal || '—'}</td>
                          <td>{item.category}</td>
                          <td>{item.price || '—'}</td>
                          <td>
                            <div className={styles.actions}>
                              <button onClick={() => openMenuForm(item)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                              <button onClick={() => deleteMenuItem(item.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── ROOMS TAB ── */}
          {tab === 'rooms' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Rooms ({rooms.length})</h2>
                  <button className={styles.addBtn} onClick={() => openRoomForm()}>+ Add Room</button>
                </div>

                {showRoomForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Room Name *</label>
                        <input value={roomForm.name} onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Deluxe Suite" />
                      </div>
                      <div className={styles.formField}>
                        <label>Size (m²) *</label>
                        <input type="number" min="1" value={roomForm.size} onChange={e => { const val = e.target.value; if (val === '' || Number(val) >= 0) setRoomForm(p => ({ ...p, size: val })); }} placeholder="e.g. 32" />
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Image</label>
                        <div className={styles.imgUploadRow}>
                          <label className={styles.uploadBtn}>
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], setRoomForm, 'img')} />
                          </label>
                          <span className={styles.orText}>or</span>
                          <input value={roomForm.img} onChange={e => setRoomForm(p => ({ ...p, img: e.target.value }))} placeholder="Paste image URL..." style={{ flex: 1 }} />
                        </div>
                        {roomForm.img && <img src={roomForm.img} alt="Preview" className={styles.imgPreview} />}
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Description</label>
                        <textarea value={roomForm.desc} onChange={e => setRoomForm(p => ({ ...p, desc: e.target.value }))} placeholder="Room description..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowRoomForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveRoom}>{editingRoom ? 'Update' : 'Add Room'}</button>
                    </div>
                  </div>
                )}

                <div className={styles.roomGrid}>
                  {rooms.map(room => (
                    <div key={room.id} className={styles.roomCard}>
                      {room.img && <img src={room.img} alt={room.name} className={styles.roomCardImg} />}
                      <div className={styles.roomCardBody}>
                        <h4 className={styles.roomCardName}>{room.name}</h4>
                        <p className={styles.roomCardPrice}>{room.size || room.price} m²</p>
                        <p className={styles.roomCardDesc}>{room.desc}</p>
                        <div className={styles.roomCardActions}>
                          <button onClick={() => openRoomForm(room)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                          <button onClick={() => deleteRoom(room.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS TAB ── */}
          {tab === 'events' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Events ({events.length})</h2>
                  <button className={styles.addBtn} onClick={() => openEventForm()}>+ Add Event</button>
                </div>

                {showEventForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Event Title *</label>
                        <input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Jazz Night" />
                      </div>
                      <div className={styles.formField}>
                        <label>Date *</label>
                        <input type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div className={styles.formField}>
                        <label>Time</label>
                        <input value={eventForm.time} onChange={e => setEventForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 8:00 PM" />
                      </div>
                      <div className={styles.formField}>
                        <label>Location</label>
                        <input value={eventForm.location} onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} placeholder="Hotel Afisha" />
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Image</label>
                        <div className={styles.imgUploadRow}>
                          <label className={styles.uploadBtn}>
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], setEventForm, 'img')} />
                          </label>
                          <span className={styles.orText}>or</span>
                          <input value={eventForm.img} onChange={e => setEventForm(p => ({ ...p, img: e.target.value }))} placeholder="Paste image URL..." style={{ flex: 1 }} />
                        </div>
                        {eventForm.img && <img src={eventForm.img} alt="Preview" className={styles.imgPreview} />}
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Description</label>
                        <textarea value={eventForm.desc} onChange={e => setEventForm(p => ({ ...p, desc: e.target.value }))} placeholder="Event description..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowEventForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveEvent}>{editingEvent ? 'Update' : 'Add Event'}</button>
                    </div>
                  </div>
                )}

                {events.length === 0 && !showEventForm ? (
                  <p className={styles.emptyMsg}>No events yet. Click &quot;+ Add Event&quot; to create one.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(ev => (
                        <tr key={ev.id}>
                          <td>
                            <strong>{ev.title}</strong>
                            {ev.desc && <span className={styles.cellSub}>{ev.desc.substring(0, 60)}{ev.desc.length > 60 ? '...' : ''}</span>}
                          </td>
                          <td>{ev.date}</td>
                          <td>{ev.time || '—'}</td>
                          <td>{ev.location}</td>
                          <td>
                            <div className={styles.actions}>
                              <button onClick={() => openEventForm(ev)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                              <button onClick={() => deleteEvent(ev.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── TEAM TAB ── */}
          {tab === 'team' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Afisha Cast ({teamMembers.length})</h2>
                  <button className={styles.addBtn} onClick={() => openTeamForm()}>+ Add Member</button>
                </div>

                {showTeamForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingTeam ? 'Edit Team Member' : 'Add Team Member'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Name *</label>
                        <input value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Smith" />
                      </div>
                      <div className={styles.formField}>
                        <label>Role *</label>
                        <input value={teamForm.role} onChange={e => setTeamForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Head Chef" />
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Image</label>
                        <div className={styles.imgUploadRow}>
                          <label className={styles.uploadBtn}>
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], setTeamForm, 'img')} />
                          </label>
                          <span className={styles.orText}>or</span>
                          <input value={teamForm.img} onChange={e => setTeamForm(p => ({ ...p, img: e.target.value }))} placeholder="Paste image URL..." style={{ flex: 1 }} />
                        </div>
                        {teamForm.img && <img src={teamForm.img} alt="Preview" className={styles.imgPreview} />}
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Bio</label>
                        <textarea value={teamForm.bio} onChange={e => setTeamForm(p => ({ ...p, bio: e.target.value }))} placeholder="Short biography..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowTeamForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveTeamMember}>{editingTeam ? 'Update' : 'Add Member'}</button>
                    </div>
                  </div>
                )}

                {teamMembers.length === 0 && !showTeamForm ? (
                  <p className={styles.emptyMsg}>No team members yet. Click &quot;+ Add Member&quot; to create one.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map(member => (
                        <tr key={member.id}>
                          <td>
                            <strong>{member.name}</strong>
                            {member.bio && <span className={styles.cellSub}>{member.bio.substring(0, 60)}{member.bio.length > 60 ? '...' : ''}</span>}
                          </td>
                          <td>{member.role}</td>
                          <td>
                            <div className={styles.actions}>
                              <button onClick={() => openTeamForm(member)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                              <button onClick={() => deleteTeamMember(member.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── VACANCIES TAB ── */}
          {tab === 'vacancies' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Vacancies ({vacancies.length})</h2>
                  <button className={styles.addBtn} onClick={() => openVacancyForm()}>+ Add Vacancy</button>
                </div>

                {showVacancyForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingVacancy ? 'Edit Vacancy' : 'Add New Vacancy'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Title *</label>
                        <input value={vacancyForm.title} onChange={e => setVacancyForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Front Desk Manager" />
                      </div>
                      <div className={styles.formField}>
                        <label>Department</label>
                        <input value={vacancyForm.department} onChange={e => setVacancyForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Hospitality" />
                      </div>
                      <div className={styles.formField}>
                        <label>Type</label>
                        <select value={vacancyForm.type} onChange={e => setVacancyForm(p => ({ ...p, type: e.target.value }))}>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                        </select>
                      </div>
                      <div className={styles.formField}>
                        <label>Contact Email</label>
                        <input value={vacancyForm.email} onChange={e => setVacancyForm(p => ({ ...p, email: e.target.value }))} placeholder="hr@hotelafisha.com" />
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Description</label>
                        <textarea value={vacancyForm.desc} onChange={e => setVacancyForm(p => ({ ...p, desc: e.target.value }))} placeholder="Job description..." />
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Requirements</label>
                        <textarea value={vacancyForm.requirements} onChange={e => setVacancyForm(p => ({ ...p, requirements: e.target.value }))} placeholder="Job requirements..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowVacancyForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveVacancy}>{editingVacancy ? 'Update' : 'Add Vacancy'}</button>
                    </div>
                  </div>
                )}

                {vacancies.length === 0 && !showVacancyForm ? (
                  <p className={styles.emptyMsg}>No vacancies yet. Click &quot;+ Add Vacancy&quot; to create one.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacancies.map(v => (
                        <tr key={v.id}>
                          <td>
                            <strong>{v.title}</strong>
                            {v.desc && <span className={styles.cellSub}>{v.desc.substring(0, 60)}{v.desc.length > 60 ? '...' : ''}</span>}
                          </td>
                          <td>{v.department || '—'}</td>
                          <td>{v.type || '—'}</td>
                          <td>
                            <span className={styles.statusBadge} style={{ background: (v.active !== false ? '#4caf50' : '#c9a96e') + '22', color: v.active !== false ? '#4caf50' : '#c9a96e' }}>
                              {v.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button onClick={() => toggleVacancyActive(v.id, v.active !== false)} className={styles.actBtn} style={{ color: v.active !== false ? '#c9a96e' : '#4caf50' }}>
                                {v.active !== false ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => openVacancyForm(v)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                              <button onClick={() => deleteVacancy(v.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── OFFERS TAB ── */}
          {tab === 'offers' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Offers ({offers.length})</h2>
                  <button className={styles.addBtn} onClick={() => openOfferForm()}>+ Add Offer</button>
                </div>

                {showOfferForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Title *</label>
                        <input value={offerForm.title} onChange={e => setOfferForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Summer Special" />
                      </div>
                      <div className={styles.formField}>
                        <label>Discount</label>
                        <input value={offerForm.discount} onChange={e => setOfferForm(p => ({ ...p, discount: e.target.value }))} placeholder="e.g. 20% off" />
                      </div>
                      <div className={styles.formField}>
                        <label>Valid Until</label>
                        <input type="date" value={offerForm.validUntil} onChange={e => setOfferForm(p => ({ ...p, validUntil: e.target.value }))} />
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Image</label>
                        <div className={styles.imgUploadRow}>
                          <label className={styles.uploadBtn}>
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" hidden onChange={e => e.target.files[0] && uploadImage(e.target.files[0], setOfferForm, 'img')} />
                          </label>
                          <span className={styles.orText}>or</span>
                          <input value={offerForm.img} onChange={e => setOfferForm(p => ({ ...p, img: e.target.value }))} placeholder="Paste image URL..." style={{ flex: 1 }} />
                        </div>
                        {offerForm.img && <img src={offerForm.img} alt="Preview" className={styles.imgPreview} />}
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Description</label>
                        <textarea value={offerForm.desc} onChange={e => setOfferForm(p => ({ ...p, desc: e.target.value }))} placeholder="Offer description..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowOfferForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveOffer}>{editingOffer ? 'Update' : 'Add Offer'}</button>
                    </div>
                  </div>
                )}

                {offers.length === 0 && !showOfferForm ? (
                  <p className={styles.emptyMsg}>No offers yet. Click &quot;+ Add Offer&quot; to create one.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Offer</th>
                        <th>Discount</th>
                        <th>Valid Until</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(o => (
                        <tr key={o.id}>
                          <td>
                            <strong>{o.title}</strong>
                            {o.desc && <span className={styles.cellSub}>{o.desc.substring(0, 60)}{o.desc.length > 60 ? '...' : ''}</span>}
                          </td>
                          <td>{o.discount || '—'}</td>
                          <td>{o.validUntil || '—'}</td>
                          <td>
                            <span className={styles.statusBadge} style={{ background: (o.active !== false ? '#4caf50' : '#c9a96e') + '22', color: o.active !== false ? '#4caf50' : '#c9a96e' }}>
                              {o.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button onClick={() => toggleOfferActive(o.id, o.active !== false)} className={styles.actBtn} style={{ color: o.active !== false ? '#c9a96e' : '#4caf50' }}>
                                {o.active !== false ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => openOfferForm(o)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                              <button onClick={() => deleteOffer(o.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── REVIEWS TAB ── */}
          {tab === 'reviews' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.panelHead}>Guest Reviews ({reviews.length})</h2>
                  <button className={styles.addBtn} onClick={() => openReviewForm()}>+ Add Review</button>
                </div>

                {showReviewForm && (
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>{editingReview ? 'Edit Review' : 'Add New Review'}</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label>Guest Name *</label>
                        <input value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sophie Laurent" />
                      </div>
                      <div className={styles.formField}>
                        <label>Country</label>
                        <input value={reviewForm.country} onChange={e => setReviewForm(p => ({ ...p, country: e.target.value }))} placeholder="e.g. France" />
                      </div>
                      <div className={styles.formField}>
                        <label>Rating</label>
                        <select value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: Number(e.target.value) }))}>
                          <option value={5}>5 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={3}>3 Stars</option>
                        </select>
                      </div>
                      <div className={`${styles.formField} ${styles.formFull}`}>
                        <label>Review Text *</label>
                        <textarea value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))} placeholder="Guest review..." />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.formCancel} onClick={() => setShowReviewForm(false)}>Cancel</button>
                      <button className={styles.formSave} onClick={saveReview}>{editingReview ? 'Update' : 'Add Review'}</button>
                    </div>
                  </div>
                )}

                {reviews.length === 0 && !showReviewForm ? (
                  <p className={styles.emptyMsg}>No reviews yet. Click &quot;+ Add Review&quot; to create one.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Guest</th>
                        <th>Country</th>
                        <th>Review</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(rv => (
                        <tr key={rv.id}>
                          <td><strong>{rv.name}</strong></td>
                          <td>{rv.country || '—'}</td>
                          <td><span className={styles.cellSub}>{rv.text.substring(0, 80)}{rv.text.length > 80 ? '...' : ''}</span></td>
                          <td>{'★'.repeat(rv.rating)}</td>
                          <td>
                            <span className={styles.statusBadge} style={{ background: (rv.status === 'approved' ? '#4caf50' : '#c9a96e') + '22', color: rv.status === 'approved' ? '#4caf50' : '#c9a96e' }}>
                              {rv.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {rv.status !== 'approved' && <button onClick={() => updateReviewStatus(rv.id, 'approved')} className={styles.actBtn} style={{ color: '#4caf50' }}>Approve</button>}
                              {rv.status === 'approved' && <button onClick={() => updateReviewStatus(rv.id, 'pending')} className={styles.actBtn} style={{ color: '#c9a96e' }}>Hide</button>}
                              <button onClick={() => openReviewForm(rv)} className={styles.actBtn} style={{ color: 'var(--accent)' }}>Edit</button>
                              <button onClick={() => deleteReview(rv.id)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── SUBSCRIBERS TAB ── */}
          {tab === 'subscribers' && (
            <div className={styles.subContent}>
              <div className={styles.subPanel}>
                <h2 className={styles.panelHead}>Newsletter Subscribers ({subscribers.length})</h2>
                {subscribers.length === 0 ? (
                  <p className={styles.emptyMsg}>No subscribers yet. They will appear here when visitors subscribe through the footer.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Subscribed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s, i) => (
                        <tr key={i}>
                          <td>{s.email}</td>
                          <td>{fmtDateTime(s.subscribedAt)}</td>
                          <td><button onClick={() => deleteSubscriber(s.email)} className={styles.actBtn} style={{ color: '#e74c3c' }}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
