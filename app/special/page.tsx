'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'

declare global {
	interface Window {
		truegateSdk: any
	}
}

export default function SpecialPage() {
	const [timerText, setTimerText] = useState('10 : 00')
	const [errorMsg, setErrorMsg] = useState('')
	const [isSuccess, setIsSuccess] = useState(false)
	const [isPayDisabled, setIsPayDisabled] = useState(true)
	const [payBtnText, setPayBtnText] = useState('PAY')

	// Флаг готовности SDK для скрытия оверлея
	const [isSdkReady, setIsSdkReady] = useState(false)
	const [overlayMsg, setOverlayMsg] = useState('Securing payment connection...')

	// Ссылки на функции и флаги
	const sdkInitRef = useRef(false)
	const submitCardRef = useRef<any>(null)

	// ==========================================
	// 1. ПРОВЕРКА EMAIL И ИНИЦИАЛИЗАЦИЯ
	// ==========================================
	useEffect(() => {
		const savedEmail = sessionStorage.getItem('userEmail')
		if (!savedEmail) {
			window.location.replace('/home-email')
			return
		}

		preparePayment(savedEmail)
	}, [])

	// ==========================================
	// 2. ЛОГИКА ТАЙМЕРА
	// ==========================================
	useEffect(() => {
		let totalSeconds = 600
		const timer = setInterval(() => {
			if (totalSeconds <= 0) {
				clearInterval(timer)
				return
			}
			totalSeconds--
			const m = Math.floor(totalSeconds / 60)
				.toString()
				.padStart(2, '0')
			const s = (totalSeconds % 60).toString().padStart(2, '0')
			setTimerText(`${m} : ${s}`)
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	// ==========================================
	// 3. ПОДКЛЮЧЕНИЕ ПЛАТЕЖНОГО ШЛЮЗА
	// ==========================================
	const preparePayment = async (targetEmail: string) => {
		// Блокируем повторные вызовы сразу же (спасает от StrictMode дублей)
		if (sdkInitRef.current) return
		sdkInitRef.current = true

		try {
			const response = await fetch(
				'https://wa-adminn.com/api/v1/subscription-payment-widget/',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						subscription_type_code: 'trial_month',
						email: targetEmail,
					}),
				},
			)

			const data = await response.json()

			if (
				!response.ok ||
				!data.payment_widget ||
				!data.payment_widget.transactionId
			) {
				throw new Error('Failed to get transaction ID')
			}

			await initTruegateSDK(data.payment_widget.transactionId)
		} catch (error) {
			// В случае ошибки разрешаем повторную инициализацию
			sdkInitRef.current = false
			setOverlayMsg('Error loading payment form. Refresh page.')
			setErrorMsg('Error loading payment form. Refresh page.')
		}
	}

	const initTruegateSDK = async (transactionId: string) => {
		await new Promise<void>(resolve => {
			if (window.truegateSdk) resolve()
			else {
				window.addEventListener('message', e => {
					if (e.data && e.data.type === 'SDK_READY') resolve()
				})
			}
		})

		const sdkInstance = new window.truegateSdk({
			id: 'payment-instance',
			transactionId: transactionId,
			env: 'PROD', // Включен боевой режим
		})

		sdkInstance.on('PAYMENT_STATUS', (payload: any) => {
			if (payload.details.status === 'SUCCESS') {
				setIsSuccess(true)
				setErrorMsg('🎉 Payment successful! Redirecting...')
				setTimeout(() => (window.location.href = '/thankyou'), 1500)
			} else if (payload.details.status === 'FAILED') {
				setErrorMsg('Payment declined by your bank. Try another card.')
				resetPayButton()
			}
		})

		sdkInstance.on('PAYMENT_ERROR', () => {
			setErrorMsg('Error processing payment. Please check card details.')
			resetPayButton()
		})

		await sdkInstance.init()

		try {
			// Дополнительная защита: очищаем контейнеры перед вставкой iframe SDK, чтобы они точно не продублировались
			const cardNumEl = document.getElementById('card-number')
			const cardExpEl = document.getElementById('card-expiration')
			const cardCvvEl = document.getElementById('card-cvv')

			if (cardNumEl) cardNumEl.innerHTML = ''
			if (cardExpEl) cardExpEl.innerHTML = ''
			if (cardCvvEl) cardCvvEl.innerHTML = ''

			const result = await sdkInstance.initCardPayment({
				cardNumberId: 'card-number',
				expirationId: 'card-expiration',
				securityCodeId: 'card-cvv',
				options: {
					FONT_NAME: 'system-ui, -apple-system, sans-serif',
					FONT_SIZE: '16px',
					COLOR: '#111827',
					PLACEHOLDER_COLOR: '#9ca3af',
					PLACEHOLDER_CARD_NUMBER: '0000 0000 0000 0000',
					PLACEHOLDER_EXPIRATION: 'MM / YY',
					PLACEHOLDER_SECURITY_CODE: 'CVC',
				},
			})
			submitCardRef.current = result.submit

			// SDK готово - скрываем оверлей загрузки и включаем кнопку
			setIsSdkReady(true)
			setIsPayDisabled(false)
		} catch (e) {
			console.error('SDK Fields Init Error', e)
		}
	}

	// ==========================================
	// 4. ОБРАБОТКА НАЖАТИЯ "PAY"
	// ==========================================
	const handlePaymentSubmit = async () => {
		if (!submitCardRef.current) return
		setErrorMsg('')
		setIsPayDisabled(true)
		setPayBtnText('Processing...')

		try {
			await submitCardRef.current({ cardHolderName: 'Card Holder' })
		} catch (error) {
			setErrorMsg('Please fill in all card details correctly.')
			resetPayButton()
		}
	}

	const resetPayButton = () => {
		setIsPayDisabled(false)
		setPayBtnText('PAY')
	}

	return (
		<>
			<Script
				src='https://sdk.truegate.tech/sdk.js'
				strategy='afterInteractive'
			/>

			{/* Встроенные стили для оверлея и iframe */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
				.secure-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; border-radius: 8px; transition: opacity 0.3s; }
				.secure-overlay.hidden { opacity: 0; pointer-events: none; }
				.relative-container { position: relative; }
				div.custom-input { height: 48px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 16px; display: flex; align-items: center; width: 100%; box-sizing: border-box; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05); }
				div.custom-input iframe { width: 100% !important; height: 100% !important; border: none !important; outline: none !important; background: transparent !important; }
			`,
				}}
			/>

			<div className='app-container'>
				<div className='alert-card'>
					<div className='settings-icon-wrapper'>
						<img src='/img/red-block.svg' alt='setting' />
					</div>
					<div className='alert-title'>
						URGENT: <span>YOUR IPHONE</span> <br /> MAY BE AT <span>RISK</span>
					</div>
					<div className='alert-desc'>
						Signs of unstable device performance have been detected. These may
						affect cellular connection, contact access, media library, and other
						important iPhone functions if the check is postponed.
					</div>

					<div className='alert-list-item'>
						<img src='/img/goog-specic1.svg' alt='setting icon' />
						Check your device, detect issues, and fix important errors.
					</div>
					<div className='alert-list-item'>
						<img src='/img/goog-specic2.svg' alt='setting icon' />
						Run a system diagnostic, detect possible failures, and resolve
						critical issues.
					</div>
				</div>

				<a href='#payment-form' className='btn-blue btn-spec'>
					Secure Device Now
				</a>

				<div className='deal-card'>
					<div className='timer-pill' id='timer'>
						{timerText}
					</div>

					<div className='deal-header'>
						<div className='deal-title'> LIMITED-TIME DEAL</div>
						<div className='deal-price-box'>
							<div className='price-new'>$4.99 / 3-day trial</div>
							<div className='price-old'>$44.99 / monthly</div>
						</div>
					</div>

					<div className='deal-check-list'>
						<div className='deal-check-item'>
							<img src='/img/galochka.svg' alt='galochka' />
							24/7 Live Device Protection
						</div>
						<div className='deal-check-item'>
							<img src='/img/galochka.svg' alt='galochka' />
							Immediate System Optimization
						</div>
						<div className='deal-check-item'>
							<img src='/img/galochka.svg' alt='galochka' />
							Advanced Threat Cleanup
						</div>
					</div>
				</div>

				<div className='payment-container' id='payment-form'>
					<h2 className='section-title' style={{ marginBottom: '24px' }}>
						ENTER YOUR PAYMENT DETAILS
					</h2>

					<div className='relative-container'>
						{/* Оверлей загрузки формы */}
						<div
							className={`secure-overlay ${isSdkReady ? 'hidden' : ''}`}
							id='card-overlay'
						>
							<p
								style={{
									fontWeight: 600,
									color: errorMsg ? 'red' : '#007bff',
									marginBottom: '10px',
									fontSize: '16px',
								}}
							>
								{overlayMsg}
							</p>
							<span style={{ color: '#666', fontSize: '14px' }}>
								Your data is protected by AES-256 encryption
							</span>
						</div>

						<div className='input-group'>
							<div id='card-number' className='custom-input'></div>
						</div>

						<div className='row-50-50'>
							<div className='input-group'>
								<div id='card-expiration' className='custom-input'></div>
							</div>
							<div className='input-group'>
								<div id='card-cvv' className='custom-input'></div>
							</div>
						</div>

						{/* Сообщения об ошибках / успехе */}
						{errorMsg && (
							<div
								id='card-errors'
								role='alert'
								style={{
									color: isSuccess ? '#10B981' : 'red',
									marginBottom: '15px',
									fontSize: '14px',
									textAlign: 'center',
									fontWeight: 'bold',
								}}
							>
								{errorMsg}
							</div>
						)}

						{/* Кнопка PAY */}
						<button
							type='button'
							id='submit-button'
							className='btn-green-pay'
							disabled={isPayDisabled}
							onClick={handlePaymentSubmit}
							style={{ opacity: isPayDisabled ? 0.5 : 1 }}
						>
							{payBtnText === 'PAY' && (
								<img src='/img/paygreen.svg' alt='pay' />
							)}
							{payBtnText}
						</button>
					</div>
				</div>

				<div className='guarantee-section'>
					<div className='guarantee-box'>
						<div className='guarantee-header'>
							<h3 className='guarantee-title'>100% Money-Back Guarantee</h3>
						</div>
						<p className='guarantee-desc'>
							We take pride in the reliability and effectiveness — thousands of
							users worldwide trust us to protect their devices and personal
							data every day. If you've experienced technical issues, we're
							committed to making it right — including offering a full refund.
						</p>
					</div>
					<div className='disclaimer-text'>
						You will be automatically charged $4.99 for a 3-day trial. The
						subscription will then be auto-renewed after 4 days at the full
						price of $44.99. Payments are charged in USD. To learn more, visit
						our Terms of Use or Privacy Policy.
					</div>
				</div>

				<h2 className='section-title' style={{ textAlign: 'left' }}>
					HERE'S WHAT'S INCLUDED
				</h2>

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

				<div className='guarantee-box'>
					<h2 className='guarantee-title'>100% REFUND ASSURANCE</h2>
					<img className='guarantee-stamp' src='/img/30svg.svg' alt='shtamp' />

					<div className='guarantee-text-dark'>
						Our service is built around reliability and effective device
						protection. Users around the world rely on it every day to help
						safeguard their devices and personal information. If technical
						problems prevented you from using the app properly, we'll work to
						resolve the situation, including providing a full refund when
						appropriate.
					</div>

					<div className='guarantee-text-light'>
						You will be charged four dollars and ninety-nine cents after payment
						confirmation. The subscription will renew monthly after the one-week
						introductory offer at the full price of forty-four dollars and
						ninety-nine cents. Payments are processed in USD. To learn more,
						visit our
						<br />
						<Link href='/policy' target='_blank'>
							Privacy Policy
						</Link>{' '}
						or{' '}
						<Link href='/terms' target='_blank'>
							Terms of Use
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}
