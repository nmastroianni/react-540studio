import Header from './components/Header'
import Footer from './components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi'
import Card from './components/Card'
import YouTubeCard from './components/YouTubeCard'

import Form from './components/Form'
function App() {
  const [loading, setLoading] = useState(true)
  const [contentData, setContentData] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const requestHandler = (e) => {
    e.preventDefault()
    setShowForm(!showForm)
  }

  const fetchData = async () => {
    const results = await axios.get('/api/getContent')
    if (results.status === 200) {
      setLoading(false)
    } else {
    }
    return results
  }
  useEffect(() => {
    fetchData().then((res) => {
      setContentData(res)
    })
  }, [])

  return (
    <div className="flex flex-col min-h-screen text-stone-800 bg-stone-200 dark:bg-stone-800 dark:text-stone-100">
      <Header requestHandler={requestHandler} showForm={showForm} />
      <div className="h-8 bg-stone-500 w-full shadow-md shadow-stone-400 dark:shadow-stone-600" />
      <main className="mx-auto font-redhat py-3 md:py-4 lg:py-6">
        {!showForm && (
          <>
            <p className="uppercase text-sm text-stone-700 dark:text-stone-200 text-center my-2 md:my-3 lg:my-8">
              Mission
            </p>
            <p className="max-w-screen-lg mx-auto prose md:prose-xl lg:prose-2xl dark:prose-invert mb-3 md:mb-4 lg:mb-6 px-3 md:px-4 lg:px-6">
              The 540 Studio aims to deliver rich and engaging media that
              prominently displays the Long Branch Green Wave pride that is
              evident throughout the halls of each school. With masterful
              storytelling as a guiding principle, we adhere to the highest of
              standards in releasing district level content.{' '}
            </p>
            <p className="uppercase text-sm text-stone-700 dark:text-stone-200 text-center mt-6 md:mt-7 lg:mt-8">
              Updates
            </p>
          </>
        )}
        {showForm && <Form onChildClick={requestHandler} showForm={showForm} />}
        {!loading && contentData && !showForm ? (
          <>
            <div id="social-content" className="px-3 md:px-4 lg:px-6">
              <ul className="max-w-screen-2xl not-prose flex flex-wrap justify-center md:gap-x-8 gap-y-8 ">
                {contentData.data.content.map((item) => {
                  return (
                    <li key={item.etag} className="py-8 lg:w-[450px]">
                      <Card>
                        <YouTubeCard
                          videoId={item.id.videoId}
                          thumbnails={item.snippet.thumbnails}
                          title={item.snippet.title}
                        />
                      </Card>
                    </li>
                  )
                })}
              </ul>
              <div className="my-3 md:my-4 lg:my-6">
                <p className="py-8 text-3xl md:text-4xl lg:text-5xl text-center">
                  Looking for more? Visit us at your preferred platform
                </p>
                <div className="flex justify-around my-3 md:my-4 lg:my-6">
                  <div className="text-center">
                    <a href="https://instagram.com/lb540studio">
                      <FiInstagram className="h-12 w-12 text-teal-700 dark:text-teal-500 mx-auto" />
                      <p className="sr-only">Check us Out on Instagram</p>
                    </a>
                  </div>
                  <div className="text-center">
                    <a href="https://twitter.com/lb540studio">
                      <FiTwitter className="h-12 w-12 text-teal-700 dark:text-teal-500 mx-auto" />
                      <p className="sr-only">Check us Out on Twitter</p>
                    </a>
                  </div>
                  <div className="text-center">
                    <a href="https://www.youtube.com/channel/UCto2jFEiI05nyTx9L3CqTOQ">
                      <FiYoutube className="h-12 w-12 text-teal-700 dark:text-teal-500 mx-auto" />
                      <p className="sr-only">Check us Out on YouTube</p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center animate-pulse text-teal-700 dark:text-teal-500">
            {!showForm && `LOADING...`}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
