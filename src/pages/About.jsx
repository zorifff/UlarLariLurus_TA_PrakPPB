import { Hand, Keyboard, Gamepad2, Pause, BrickWall, Gauge, Code, ExternalLink, UserRound } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import LoadingState from '../components/LoadingState.jsx'
import FoodIcon from '../components/FoodIcon.jsx'
import useFetch from '../hooks/useFetch.js'
import { getGameFoods } from '../services/foodService.js'

// Profil pembuat — sesuaikan bila perlu
const CREATOR = {
  name: 'Muhammad Zhorif Zaidaan Ramadhan',
  nim: '21120124140140',
  course: 'Praktikum Pemrograman Perangkat Bergerak · Ganjil 2026',
  github: 'https://github.com/zorifff',
  repo: 'https://github.com/zorifff/UlarLariLurus_TA_PrakPPB',
}

const HOW_TO_PLAY = [
  { icon: Hand, text: 'Geser (swipe) di arena untuk membelokkan ular.' },
  { icon: Gamepad2, text: 'Atau tekan tombol arah di bawah arena.' },
  { icon: Keyboard, text: 'Di komputer: tombol panah atau W A S D. Spasi untuk jeda.' },
  { icon: BrickWall, text: 'Jangan menabrak tembok atau badanmu sendiri.' },
  { icon: Gauge, text: 'Setiap makan, ular bertambah panjang dan sedikit lebih cepat.' },
  { icon: Pause, text: 'Game otomatis dijeda saat kamu meninggalkan aplikasi.' },
]

function About() {
  const { data: foods, loading } = useFetch(getGameFoods, [])

  return (
    <div className="page">
      <PageHeader title="Tentang" />

      <section className="card about-intro">
        <img src="/favicon.svg" alt="" width="64" height="64" />
        <div>
          <h2 className="about-intro__name">Ularlarilurus</h2>
          <p className="about-intro__version">Versi {__APP_VERSION__}</p>
        </div>
        <p className="about-intro__desc">
          Game ular klasik dalam bentuk Progressive Web App. Makan buah untuk menambah poin dan panjang ular, hindari
          tembok dan badan sendiri, lalu bersaing di papan peringkat global. Bisa dipasang di HP dan tetap bisa dimainkan
          saat offline.
        </p>
      </section>

      <h2 className="section-title">Cara main</h2>
      <ul className="card how-to">
        {HOW_TO_PLAY.map(({ icon: Icon, text }) => (
          <li key={text}>
            <Icon size={20} aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Panduan makanan</h2>
      {!foods && loading ? (
        <LoadingState message="Memuat daftar makanan…" />
      ) : (
        <ul className="list">
          {(foods ?? []).map((food) => (
            <li key={food.id} className="list-row food-row">
              <FoodIcon id={food.id} color={food.color} size={36} />
              <div className="list-row__main">
                <span className="list-row__title">
                  {food.name}
                  {food.is_bonus && <span className="tag tag--bonus">Bonus</span>}
                </span>
                <span className="food-row__desc">{food.description}</span>
                {food.is_bonus && (
                  <span className="food-row__desc">
                    Peluang muncul {Math.round(food.spawn_chance * 100)}% · hilang setelah {food.lifetime_ticks} langkah
                  </span>
                )}
              </div>
              <span className="food-row__points">+{food.points}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="section-title">Pembuat</h2>
      <section className="card creator">
        <div className="creator__avatar" aria-hidden="true">
          <UserRound size={28} />
        </div>
        <div className="creator__text">
          <p className="creator__name">{CREATOR.name}</p>
          {CREATOR.nim && <p className="creator__meta">NIM {CREATOR.nim}</p>}
          <p className="creator__meta">{CREATOR.course}</p>
        </div>
      </section>
      <div className="link-list">
        <a className="btn btn--block" href={CREATOR.repo} target="_blank" rel="noreferrer">
          <Code size={18} aria-hidden="true" />
          Source code di GitHub
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>

      <p className="about-footer">
        Dibuat dengan React, Vite, vite-plugin-pwa, Vercel Functions, dan Neon Postgres.
      </p>
    </div>
  )
}

export default About
