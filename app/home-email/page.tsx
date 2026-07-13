'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Утилиты для работы с куки
function setCookie(name: string, value: string, days = 30) {
	const date = new Date()
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
	document.cookie =
		name +
		'=' +
		encodeURIComponent(value) +
		';expires=' +
		date.toUTCString() +
		';path=/'
}

function getCookie(name: string) {
	const nameEQ = name + '='
	const ca = document.cookie.split(';')
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i].trim()
		if (c.indexOf(nameEQ) === 0)
			return decodeURIComponent(c.substring(nameEQ.length, c.length))
	}
	return null
}

export default function HomeEmail() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [clickId, setClickId] = useState('')

	// Проверка валидности Email
	const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
		email,
	)
	const PLAN_CODE = 'trial_month'

	// Инициализация (захват Click ID)
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		let currentClickId =
			urlParams.get('clickid') ||
			urlParams.get('clk_id') ||
			urlParams.get('click_id') ||
			''

		if (currentClickId) {
			localStorage.setItem('clickid', currentClickId)
			setCookie('clickid', currentClickId, 30)
		} else {
			currentClickId =
				localStorage.getItem('clickid') || getCookie('clickid') || ''
		}

		setClickId(currentClickId)
	}, [])

	// Обработчик ввода (запрет пробелов и кириллицы)
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value
		value = value.replace(/[А-Яа-яЁё\s]/g, '') // удаляем пробелы и кириллицу
		value = value.replace(/[^A-Za-z0-9@._%+-]/g, '') // оставляем только латиницу и знаки email
		setEmail(value)
	}

	// Кнопки доменов
	const handleDomainClick = (domain: string) => {
		const username = email.split('@')[0]
		setEmail(username + domain)
	}

	// Отправка данных
	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		if (!isValidEmail || loading) return

		const emailValue = email.trim()
		const currentSavedEmail = sessionStorage.getItem('userEmail')

		// Очистка старой сессии, если почту сменили
		if (currentSavedEmail && currentSavedEmail !== emailValue) {
			sessionStorage.removeItem('isLoggedIn')
			sessionStorage.removeItem('accessToken')
			sessionStorage.removeItem('refreshToken')
		}

		setLoading(true)

		try {
			// 1. Отправляем запрос на регистрацию
			const response = await fetch('https://wa-adminn.com/api/v1/register/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: emailValue,
					subscription_type_code: PLAN_CODE,
					click_id: clickId,
					clickid: clickId,
				}),
			})

			const data = await response.json()

			if (response.ok) {
				if (data.truegate_external_user_id) {
					localStorage.setItem('tg_user_id', data.truegate_external_user_id)
				}
				sessionStorage.setItem('userEmail', emailValue)

				// 2. Предзагрузка виджета оплаты (ускоряет появление формы на следующей странице)
				try {
					const wRes = await fetch(
						'https://wa-adminn.com/api/v1/subscription-payment-widget/',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								subscription_type_code: PLAN_CODE,
								email: emailValue,
							}),
						},
					)
					const wData = await wRes.json()
					if (wData?.payment_widget?.transactionId) {
						sessionStorage.setItem(
							'preloadedTxId',
							wData.payment_widget.transactionId,
						)
					}
				} catch (err) {
					console.error('Preload error', err) // Игнорируем ошибку, следующая страница загрузит сама
				}

				// Переходим на страницу special (вместо specialgoogle.html) с параметрами URL
				router.push('/special' + window.location.search)
			} else {
				alert(data.error || data.detail || 'Error: Could not create account.')
				setLoading(false)
			}
		} catch (error) {
			alert('Network error. Please try again.')
			setLoading(false)
		}
	}

	return (
		<div className='app-container'>
			<div className='stats-banner'>
				<img src='/img/google-collab.svg' alt='people' />
				<div>
					<span className='stats-blue'>OVER 5 MILLION</span>
					<span className='stats-dark'>USERS CHOOSE US</span>
				</div>
			</div>

			<div className='block-d'>
				<h1 className='mail-title'>
					ENTER YOUR EMAIL TO STRENGTHEN YOUR DEVICE PROTECTION!
				</h1>
				<p className='sub-desc'>
					We'll create an account for you to manage your security and protection
					settings.
				</p>

				<div className='input-wrapper'>
					<label htmlFor='emailInput' className='input-label'>
						Name
					</label>
					<input
						type='email'
						id='emailInput'
						className={`email-input ${!isValidEmail && email.length > 0 ? 'error-border' : ''}`}
						autoComplete='off'
						value={email}
						onChange={handleEmailChange}
					/>
				</div>

				<div className='domain-row'>
					<button
						className='domain-btn'
						onClick={() => handleDomainClick('@gmail.com')}
					>
						@gmail.com
					</button>
					<button
						className='domain-btn'
						onClick={() => handleDomainClick('@yahoo.com')}
					>
						@yahoo.com
					</button>
					<button
						className='domain-btn'
						onClick={() => handleDomainClick('@hotmail.com')}
					>
						@hotmail.com
					</button>
				</div>

				<button
					onClick={handleSubmit}
					className={`btn-blue ${!isValidEmail || loading ? 'disabled' : ''}`}
				>
					{loading ? 'LOADING...' : 'Continue'}
				</button>

				<div className='footer-secure footer-em'>
					<img src='/img/safetygreen.svg' alt='safety' /> 100% Private & Secure
				</div>
			</div>
		</div>
	)
}
