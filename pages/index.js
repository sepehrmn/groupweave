import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Game.module.css';

const rounds = [
  ['/cactus_1.jpeg', '/cactus_2.jpeg'],
  ['/dress_1.jpeg', '/dress_2.jpeg']
];

export default function Home() {
  // duration of each round in seconds
  const ROUND_DURATION = 10;

  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [selected, setSelected] = useState(null); // 0 or 1
  const [choicesCount, setChoicesCount] = useState([0, 0]);
  const [winner, setWinner] = useState(null); // 0 or 1
  const [showResult, setShowResult] = useState(false);
  const CRITERIA = 'NOT AI generated';

  // countdown / end-of-round logic
  useEffect(() => {
    if (showResult) return; // stop when we are showing results

    if (timeLeft === 0) {
      // decide winner based on selections so far (placeholder for backend aggregation)
      const winIdx = choicesCount[0] >= choicesCount[1] ? 0 : 1;
      setWinner(winIdx);
      setShowResult(true);
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft, showResult, choicesCount]);

  const handleSelect = (idx) => {
    if (selected !== null || showResult) return;
    setSelected(idx);
    setChoicesCount((prev) => {
      const next = [...prev];
      next[idx] += 1;
      return next;
    });
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setTimeLeft(ROUND_DURATION);
    setSelected(null);
    setChoicesCount([0, 0]);
    setWinner(null);
    setShowResult(false);
  };

  return (
    <>
      <Head>
        <title>GroupWeave</title>
        <meta name="description" content="Pick the more realistic image!" />
      </Head>

      <div className={styles.container}>
        <div className={styles.tagline}>GroupWeave&nbsp;Co-Creation</div>
        <h2 className={styles.subtitle}>
          Pick the image(s) &nbsp;
          <span className={styles.criteria}>{CRITERIA}</span>
        </h2>
        {/* countdown */}
        <div className={styles.timer}>{timeLeft}</div>

        {/* image options */}
        <div className={styles.images}>
          {rounds[round].map((src, idx) => (
            <div
              key={src}
              className={`${styles.imageWrapper} ${
                showResult ? (idx === winner ? styles.winner : styles.loser) : ''
              }`}
            >
              <img src={src} alt={`Option ${idx === 0 ? 'A' : 'B'}`} className={styles.image} />
              <button
                className={`${styles.btn} ${selected === idx ? styles.selectedBtn : ''}` }
                onClick={() => handleSelect(idx)}
                disabled={selected !== null || showResult}
              >
                {`Select ${idx === 0 ? 'A' : 'B'}`}
              </button>
            </div>
          ))}
        </div>

        {showResult && (
          <div className={styles.result}>
            {selected === winner ? 'You won!' : 'Better luck next time'} – Majority chose{' '}
            {winner === 0 ? 'A' : 'B'}
          </div>
        )}

        {showResult && round < rounds.length - 1 && (
          <button className={styles.nextBtn} onClick={nextRound}>
            Next Round
          </button>
        )}

        {showResult && round === rounds.length - 1 && (
          <div className={styles.result}>Thanks for playing!</div>
        )}
      </div>
    </>
  );
}
/*
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import Overlay from '../components/Overlay';
import { Evm, getContractPrice, convertToDecimal } from '../utils/ethereum';

const contractId = process.env.NEXT_PUBLIC_contractId;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
    const [message, setMessage] = useState('');
    const [accountId, setAccountId] = useState();
    const [balance, setBalance] = useState('0');
    const [ethAddress, setEthAddress] = useState('');
    const [ethBalance, setEthBalance] = useState('0');
    const [contractPrice, setContractPrice] = useState(null);
    const [lastTxHash, setLastTxHash] = useState(null);
    const [error, setError] = useState('');

    const setMessageHide = async (message, dur = 3000, success = false) => {
        setMessage({ text: message, success });
        await sleep(dur);
        setMessage('');
    };

    const getWorkerDetails = async () => {
        const res = await fetch('/api/getWorkerAccount').then((r) => r.json());
        if (res.error) {
            console.log('Error getting worker account:', res.error);
            setError('Failed to get worker account details');
            return;
        }
        setAccountId(res.accountId);
        const formattedBalance = convertToDecimal(res.balance.toString(), 24);
        setBalance(formattedBalance);
    };

    const getEthInfo = async () => {
        try {
            const res = await fetch('/api/getEthAccount').then((r) => r.json());
            if (res.error) {
                console.log('Error getting ETH account:', res.error);
                setError('Failed to get ETH account details');
                return;
            }
            const address = res.senderAddress;
            const balance = await Evm.getBalance(address);
            setEthAddress(address);
            const formattedBalance = convertToDecimal(balance.balance.toString(), balance.decimals);
            setEthBalance(formattedBalance);
        } catch (error) {
            console.log('Error fetching ETH info:', error);
            setError('Failed to fetch ETH account details');
        }
    };

    const getPrice = async () => {
        try {
            const price = await getContractPrice();
            const displayPrice = (parseInt(price.toString()) / 100).toFixed(2);
            setContractPrice(displayPrice);
        } catch (error) {
            console.log('Error fetching contract price:', error);
            setError('Failed to fetch contract price');
        }
    };

    useEffect(() => {
        getWorkerDetails();
        getEthInfo();
        getPrice();
        const interval = setInterval(() => {
            getEthInfo();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>ETH Price Oracle</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Overlay message={message} />

            <main className={styles.main}>
                <h1 className={styles.title}>ETH Price Oracle</h1>
                <div className={styles.subtitleContainer}>
                    <h2 className={styles.subtitle}>Powered by Shade Agents</h2>
                </div>
                <p>
                    This is a simple example of a verifiable price oracle for an ethereum smart contract using Shade Agents.
                </p>
                <ol>
                    <li>
                        Keep the worker account funded with testnet NEAR tokens
                    </li>
                    <li>
                        Fund the Ethereum Sepolia account (0.001 ETH will do)
                    </li>
                    <li>
                        Send the ETH price to the Ethereum contract
                    </li>
                </ol>

                {contractPrice !== null && (
                    <div style={{ 
                        background: '#f5f5f5', 
                        padding: '1.25rem', 
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        maxWidth: '350px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h3 style={{ 
                            margin: '0 0 0.5rem 0',
                            color: '#666',
                            fontSize: '1.1rem'
                        }}>Current Set ETH Price</h3>
                        <p style={{ 
                            fontSize: '2rem', 
                            margin: '0',
                            fontFamily: 'monospace',
                            color: '#333'
                        }}>
                            ${contractPrice}
                        </p>
                    </div>
                )}
                {lastTxHash && (
                    <div style={{ 
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        maxWidth: '350px'
                    }}>
                        <a 
                            href={`https://sepolia.etherscan.io/tx/${lastTxHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#0070f3', 
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            View the transaction on Etherscan 
                        </a>
                    </div>
                )}

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <h3>Fund Worker Account</h3>
                        <p>
                            <br />
                            {accountId?.length >= 24
                                ? `${accountId.substring(0, 10)}...${accountId.substring(accountId.length - 4)}`
                                : accountId}
                            <br />
                            <button
                                className={styles.btn}
                                onClick={() => {
                                    try {
                                        if(navigator.clipboard && navigator.clipboard.writeText) {
                                            navigator.clipboard.writeText(accountId);
                                            setMessageHide('Copied', 500, true);
                                        } else {
                                            setMessageHide('Clipboard not supported', 3000, true);
                                        }
                                    } catch (e) {
                                        setMessageHide('Copy failed', 3000, true);
                                    }
                                }}
                            >
                                copy
                            </button>
                            <br />
                            <br />
                            balance:{' '}
                            {(() => {
                                if (!balance) {
                                    return '0';
                                }
                                try {
                                    return balance;
                                } catch (error) {
                                    console.error('Error formatting balance:', error);
                                    return '0';
                                }
                            })()}
                            <br />
                            <a 
                                href="https://near-faucet.io/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    color: '#0070f3', 
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Get Testnet NEAR tokens from faucet →
                            </a>
                        </p>
                    </div>

                    <div className={styles.card}>
                        <h3>Fund Sepolia Account</h3>
                        <p>
                            <br />
                            {ethAddress ? (
                                <>
                                    {ethAddress.substring(0, 10)}...{ethAddress.substring(ethAddress.length - 4)}
                                    <br />
                                    <button
                                        className={styles.btn}
                                        onClick={() => {
                                            try {
                                                if(navigator.clipboard && navigator.clipboard.writeText) {
                                                    navigator.clipboard.writeText(ethAddress);
                                                    setMessageHide('Copied', 500, true);
                                                } else {
                                                    setMessageHide('Clipboard not supported', 3000, true);
                                                }
                                            } catch (e) {
                                                setMessageHide('Copy failed', 3000, true);
                                            }
                                        }}
                                    >
                                        copy
                                    </button>
                                    <br />
                                    <br />
                                    Balance: {ethBalance ? ethBalance : '0'} ETH
                                    <br />
                                    <a 
                                        href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            color: '#0070f3', 
                                            textDecoration: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Get Sepolia ETH from faucet →
                                    </a>
                                </>
                            ) : (
                                'Loading...'
                            )}
                        </p>
                    </div>

                    <a
                        href="#"
                        className={styles.card}
                        onClick={async () => {
                            setMessage({ 
                                text: 'Querying and sending the ETH price to the Ethereum contract...',
                                success: false
                            });

                            try {
                                const res = await fetch('/api/sendTransaction').then((r) => r.json());

                                if (res.txHash) {
                                    // Optimistically update the price
                                    setContractPrice(res.newPrice);
                                    setLastTxHash(res.txHash);
                                    setMessageHide(
                                        <>
                                            <p>Successfully set the ETH price!</p>
                                        </>,
                                        3000,
                                        true
                                    );
                                } else {
                                    setMessageHide(
                                        <>
                                            <h3>Error</h3>
                                            <p>
                                            Check that both accounts have been funded.
                                            </p>
                                        </>,
                                        3000,
                                        true
                                    );
                                }
                            } catch (e) {
                                console.error(e);
                                setMessageHide(
                                    <>
                                        <h3>Error</h3>
                                        <p>
                                        Check that both accounts have been funded.
                                        </p>
                                    </>,
                                    3000,
                                    true
                                );
                            }
                        }}
                    >
                        <h3>Set ETH Price</h3>
                        <p className={styles.code}>
                            Click to set the ETH price in the smart contract
                        </p>
                    </a>
                </div>
            </main>

            <div style={{ 
                textAlign: 'center',
                marginBottom: '1rem'
            }}>
                <a
                    href="https://fringe-brow-647.notion.site/Terms-for-Price-Oracle-1fb09959836d807a9303edae0985d5f3"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: '#0070f3',
                        fontSize: '0.8rem',
                        textDecoration: 'none'
                    }}
                >
                    Terms of Use
                </a>
            </div>

            <footer className={styles.footer}>
                <a
                    href="https://proximity.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src="/symbol.svg"
                        alt="Proximity Logo"
                        className={styles.logo}
                    />
                    <img
                        src="/wordmark_black.svg"
                        alt="Proximity Logo"
                        className={styles.wordmark}
                    />
                </a>
            </footer>
            {error && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ff4444',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 1000
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
*/
