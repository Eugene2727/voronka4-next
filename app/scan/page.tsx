'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const logsData = [
	{
		type: 'error',
		code: '184726',
		desc: 'auth_session_expired while validating cached credentials',
	},
	{
		type: 'error',
		code: '672940',
		desc: 'api_gateway_timeout upstream service did not respond',
	},
	{
		type: 'warning',
		code: '149285',
		desc: 'service_health_probe returned degraded status',
	},
	{
		type: 'success',
		code: '781204',
		desc: 'auth_session_restore completed without conflicts',
	},
	{
		type: 'error',
		code: '438219',
		desc: 'database_write_failed constraint violation on user_state',
	},
	{
		type: 'error',
		code: '590318',
		desc: 'config_reload_failed malformed environment override',
	},
	{
		type: 'error',
		code: '826104',
		desc: 'cache_index_corrupted checksum validation failed',
	},
	{
		type: 'warning',
		code: '902347',
		desc: 'ui_render_queue skipped delayed frame update',
	},
	{
		type: 'error',
		code: '305771',
		desc: 'message_queue_overflow dropped pending sync events',
	},
	{
		type: 'error',
		code: '947260',
		desc: 'permission_scope_mismatch requested token lacks required grant',
	},
	{
		type: 'warning',
		code: '612804',
		desc: 'retry_policy_triggered after unstable endpoint response',
	},
	{
		type: 'error',
		code: '218604',
		desc: 'storage_volume_full unable to persist diagnostic snapshot',
	},
	{
		type: 'error',
		code: '763915',
		desc: 'ssl_certificate_expired secure channel negotiation failed',
	},
	{
		type: 'success',
		code: '845601',
		desc: 'file_descriptor_cleanup released inactive handles',
	},
	{
		type: 'error',
		code: '409582',
		desc: 'worker_thread_crashed unhandled exception in task executor',
	},
]

export default function ScanPage() {
	const [progress, setProgress] = useState(0)
	const [visibleLogs, setVisibleLogs] = useState<typeof logsData>([])
	const [isComplete, setIsComplete] = useState(false)
	const [showPopup, setShowPopup] = useState(false)
	const [clickId, setClickId] = useState('')

	const containerRef = useRef<HTMLDivElement>(null)

	// Читаем Click ID из URL при загрузке
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const id = urlParams.get('clickid') || urlParams.get('clk_id') || ''
		setClickId(id)
	}, [])

	// Логика сканирования
	useEffect(() => {
		const scanDuration = 2000 // 2 секунды (как в твоем новом JS)
		const updateInterval = 50
		const step = 100 / (scanDuration / updateInterval)
		let currentProgress = 0

		const timer = setInterval(() => {
			currentProgress += step

			if (currentProgress >= 100) {
				currentProgress = 100
				clearInterval(timer)

				// Завершение визуала
				setTimeout(() => setIsComplete(true), 200)
				// Показ попапа через 1 секунду после завершения
				setTimeout(() => setShowPopup(true), 1000)
			}

			setProgress(currentProgress)
			const targetLogsCount = Math.floor(
				(currentProgress / 100) * logsData.length,
			)
			setVisibleLogs(logsData.slice(0, targetLogsCount))

			// Автоскролл
			if (containerRef.current) {
				containerRef.current.scrollTop = containerRef.current.scrollHeight
			}
		}, updateInterval)

		return () => clearInterval(timer)
	}, [])

	// Ссылка для кнопки в попапе (передаем параметры дальше по воронке)
	const nextUrl = `/home-email${clickId ? `?clickid=${clickId}` : ''}`

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
				:root { --bg-color: #f4f4f7; --blue: #007aff; --red: #ff3b30; --orange: #ff9500; --green: #34c759; --gray-text: #8e8e93; }
				* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
				body { display: flex; justify-content: center; background: #f0f1f4;}
				
				.mobile-container { width: 100%; max-width: 430px; height: 100vh; background-color: var(--bg-color); display: flex; flex-direction: column; overflow: hidden; position: relative; }
				.header-section { padding: 30px 20px 5px; text-align: center; }
				.page-title { font-size: 24px; font-weight: 800; color: #333; margin: 0 0 5px; }
				.page-subtitle { font-size: 15px; color: #555; }
				
				.progress-box { background: #fff; margin: 15px 20px; padding: 12px 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); }
				.progress-track { flex: 1; background-color: #e5e5ea; height: 10px; border-radius: 5px; overflow: hidden; }
				.progress-fill { background-color: var(--red); height: 10px; border-radius: 5px; transition: width 0.1s linear; }
				.progress-percent { color: var(--red); font-weight: 700; font-size: 16px; min-width: 45px; text-align: right; }
				
				.logs-container { flex: 1; padding: 0 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; scroll-behavior: smooth; }
				.logs-container::-webkit-scrollbar { width: 0px; }
				.log-item { background: #fff; border-radius: 12px; padding: 12px 15px; display: flex; align-items: flex-start; gap: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); animation: fadeIn 0.3s ease-out forwards; }
				@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
				.log-item.error { border-left: 3px solid var(--red); }
				.log-item.warning { border-left: 3px solid var(--orange); }
				.log-item.success { border-left: 3px solid var(--green); }
				.log-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
				.log-code { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
				.log-desc { font-size: 11px; color: var(--gray-text); line-height: 1.2; }
				
				.bottom-section { padding: 0 20px; }
				.scan-banner { background: #000; border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
				.banner-title { color: var(--red); font-size: 16px; font-weight: 700; }
				.banner-sub { color: #8e8e93; font-size: 11px; margin-top: 2px; }
				
				.critical-banner { background: var(--red); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 10px; color: white; font-size: 22px; font-weight: 700; margin-bottom: 20px; }
				
				.footer { text-align: center; padding-bottom: 20px; }
				.privacy-link { color: var(--blue); text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; }
				.copyright { color: var(--gray-text); font-size: 12px; margin-top: 8px; }

				/* Popup Styles */
				.popup-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(3px); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
				.popup-overlay.show { opacity: 1; pointer-events: auto; }
				.popup-box { background: #fff; width: 90%; max-width: 340px; border-radius: 24px; padding: 24px 20px; box-sizing: border-box; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); transform: translateY(20px) scale(0.95); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
				.popup-overlay.show .popup-box { transform: translateY(0) scale(1); }
				
				.popup-top-icon { margin-top: -50px; margin-bottom: 16px; display: flex; justify-content: center; }
				.popup-top-icon img { width: 64px; height: 64px; border-radius: 50%; box-shadow: 0 4px 15px rgba(255,45,70,0.3); }
				
				.popup-title { color: #FF2D46; font-size: 22px; font-weight: 800; margin: 0 0 5px 0; }
				.popup-subtitle { color: #8E8E93; font-size: 16px; margin-bottom: 20px; }
				.text-red-bold { color: #FF2D46; font-weight: 800; }
				
				.popup-details { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
				.detail-row { display: flex; align-items: center; justify-content: space-between; font-size: 14px; text-align: left; }
				.detail-icon { width: 24px; height: 24px; flex-shrink: 0; margin-right: 10px; display: flex; align-items: center; justify-content: center; }
				.detail-icon img { width: 100%; height: 100%; }
				.detail-label { color: #333; flex: 1; }
				.detail-val { color: #FF2D46; font-weight: 600; text-align: right; }
				
				.popup-wait-text { font-size: 12px; color: #8E8E93; margin-bottom: 20px; }
				.popup-btn { display: block; background-color: #007AFF; color: #FFF; text-decoration: none; padding: 16px; font-size: 16px; font-weight: 700; text-transform: uppercase; }
			`,
				}}
			/>

			<div className='mobile-container'>
				<div className='header-section'>
					<h1 className='page-title'>SYSTEM LOGS</h1>
					<p className='page-subtitle'>
						Real-time event monitoring and analysis
					</p>
				</div>

				<div className='progress-box'>
					<div className='progress-track'>
						<div
							className='progress-fill'
							style={{ width: `${progress}%` }}
						></div>
					</div>
					<div className='progress-percent'>{Math.floor(progress)}%</div>
				</div>

				<div className='logs-container' ref={containerRef}>
					{visibleLogs.map((log, idx) => (
						<div key={idx} className={`log-item ${log.type}`}>
							<div className='log-icon'>
								{log.type === 'error' ? (
									<img
										src='/img/icon-crit.svg'
										alt='error'
										style={{ width: '100%', height: '100%' }}
									/>
								) : log.type === 'warning' ? (
									<img
										src='/img/icon-warn.svg'
										alt='warning'
										style={{ width: '100%', height: '100%' }}
									/>
								) : (
									<img
										src='/img/icon-good.svg'
										alt='success'
										style={{ width: '100%', height: '100%' }}
									/>
								)}
							</div>
							<div className='log-content'>
								<div className='log-code'>{log.code}</div>
								<div className='log-desc'>{log.desc}</div>
							</div>
						</div>
					))}
				</div>

				<div className='bottom-section'>
					{!isComplete ? (
						<div className='scan-banner'>
							<img
								src='/img/speaker_phone.svg'
								alt='warning'
								style={{ width: '24px', height: '24px' }}
							/>
							<div className='banner-text'>
								<div className='banner-title'>DEVICE SECURITY SCAN</div>
								<div className='banner-sub'>
									Potential issues detected during system analysis
								</div>
							</div>
						</div>
					) : (
						<div className='result-box'>
							<div className='critical-banner'>
								<img
									src='/img/molnia-google.svg'
									alt='critical'
									style={{ width: '24px', height: '24px' }}
								/>
								<span>CRITICAL 14</span>
							</div>
						</div>
					)}
				</div>

				<div className='footer'>
					<a href='/policy' target='_blank' className='privacy-link'>
						Privacy Policy
					</a>
					<div className='copyright'>© 2026. All rights reserved.</div>
				</div>
			</div>

			{/* Модальное окно (Попап) */}
			<div className={`popup-overlay ${showPopup ? 'show' : ''}`}>
				<div className='popup-box'>
					<div className='popup-top-icon'>
						<img src='/img/warn-popup.svg' alt='molnia' />
					</div>

					<h2 className='popup-title'>SECURITY WARNING</h2>
					<div className='popup-subtitle'>
						Your risk level: <span className='text-red-bold'>HIGH</span>
					</div>

					<div className='popup-details'>
						<div className='detail-row'>
							<div className='detail-icon'>
								<img src='/img/ic-pop1.svg' alt='pop' />
							</div>
							<span className='detail-label'>Location signal:</span>
							<span className='detail-val'>Warsaw, Poland</span>
						</div>
						<div className='detail-row'>
							<div className='detail-icon'>
								<img src='/img/ic-pop2.svg' alt='pop' />
							</div>
							<span className='detail-label'>Detected IP range:</span>
							<span className='detail-val'>178.223.218.</span>
						</div>
						<div className='detail-row'>
							<div className='detail-icon'>
								<img src='/img/ic-pop3.svg' alt='pop' />
							</div>
							<span className='detail-label'>System integrity:</span>
							<span className='detail-val'>Suspicious activity</span>
						</div>
						<div className='detail-row'>
							<div className='detail-icon'>
								<img src='/img/ic-pop4.svg' alt='pop' />
							</div>
							<span className='detail-label'>Wi-Fi security:</span>
							<span className='detail-val'>Unprotected network</span>
						</div>
						<div className='detail-row'>
							<div className='detail-icon'>
								<img src='/img/ic-pop5.svg' alt='pop' />
							</div>
							<span className='detail-label'>Data exposure risk:</span>
							<span className='detail-val'>Possible leak</span>
						</div>
					</div>

					<div className='popup-wait-text'>
						Please wait — device scan is running.
					</div>

					<Link href={nextUrl} className='popup-btn'>
						PROTECT MY DEVICE
					</Link>
				</div>
			</div>
		</>
	)
}
