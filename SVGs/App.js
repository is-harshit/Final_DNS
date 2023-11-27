import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers";

import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

import contractAbi0 from './utils/contractABI.json';

// import { useNFT } from "@thirdweb-dev/react";


// Add the domain you will be minting

const tld = '.innovate';
var CONTRACT_ADDRESS = '';

const arr_nft=['0x87d0Bc075e79bb31EC5D94D0dd4be998B52C8055',"ddd"];
const arr_svg=['']

const contractABI_arr=[contractAbi0];
var contractAbi=contractAbi0;


const App = () => {
	
	let tx_hash;

	const [nft,setnft]=useState(false);
	
	const [flag,setflag]=useState(false);
	const [mints, setMints] = useState([]);

	const [editing, setEditing] = useState(false);
  
	const [currentAccount, setCurrentAccount] = useState('');
	// Add some state data propertie
	const [network, setNetwork] = useState('');
	const [domain, setDomain] = useState('');
	const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState('');



  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }
			
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }
    
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
    
    // This is the new part, we check the user's network chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);
    
    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };


  const switchNetwork = async () => {
	if (window.ethereum) {
	  try {
		// Try to switch to the Mumbai testnet
		await window.ethereum.request({
		  method: 'wallet_switchEthereumChain',
		  params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
		});
	  } catch (error) {
		// This error code means that the chain we want has not been added to MetaMask
		// In this case we ask the user to add it to their MetaMask
		if (error.code === 4902) {
		  try {
			await window.ethereum.request({
			  method: 'wallet_addEthereumChain',
			  params: [
				{	
				  chainId: '0x13881',
				  chainName: 'Polygon Mumbai Testnet',
				  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
				  nativeCurrency: {
					  name: "Mumbai Matic",
					  symbol: "MATIC",
					  decimals: 18
				  },
				  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
				},
			  ],
			});
		  } catch (error) {
			console.log(error);
		  }
		}
		console.log(error);
	  }
	} else {
	  // If window.ethereum is not found then MetaMask is not installed
	  alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
	} 
  }

  const Show_confirmation=()=>{
	return(
		<div classname='display_mint'>
			{/* <button className='cta-button mint-button' disabled={loading} onClick={}>
					Set record
				  </button> */}
			<h2 id='display'><a href={"https://mumbai.polygonscan.com/tx/"+tx_hash} target="_blank" style={{textDecoration:'none'}} >Record of Transaction</a></h2>  
			{/* <h2 id='display1'><a href={"https://mumbai.polygonscan.com/address/"+CONTRACT_ADDRESS} target="_blank" >Contract Adress</a></h2> */}

			<h2 id='display1'><a href="https://testnets.opensea.io/collection/ninja-name-service-140" target="_blank" style={{textDecoration:'none'}} >Check Minted Domain on OpenSea</a></h2>

		</div>
	)
  };

	const mintDomain = async () => {
		// Don't run if the domain is empty
		if (!domain) { return }
		// Alert the user if the domain is too short
		if (domain.length < 3) {
			alert('Domain must be at least 3 characters long');
			return;
		}
		// Calculate price based on length of domain (change this to match your contract)	
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
		console.log("Minting domain", domain, "with price", price);
	  try {
		const { ethereum } = window;
		if (ethereum) {
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
	
				console.log("Going to pop wallet now to pay gas...")
		  let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
		  // Wait for the transaction to be mined
				const receipt = await tx.wait();
	
				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
					
					
					// Set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();
	
					console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
					
					tx_hash=tx.hash;

					setflag(true);
					setRecord('');
					setDomain('');
				}
				else {
					alert("Transaction failed! Please try again");
				}
		}
	  }
	  catch(error){
		console.log(error);
	  }
	}

	const fetchMints = async () => {
		try {
		  const { ethereum } = window;
		  if (ethereum) {
			// You know all this
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
			  
			// Get all the domain names from our contract
			const names = await contract.getAllNames();
			  
			// For each name, get the record and the address
			const mintRecords = await Promise.all(names.map(async (name) => {
			const mintRecord = await contract.records(name);
			const owner = await contract.domains(name);
			return {
			  id: names.indexOf(name),
			  name: name,
			  record: mintRecord,
			  owner: owner,
			};
		  }));
	  
		  console.log("MINTS FETCHED ", mintRecords);
		  setMints(mintRecords);
		//   setflag(true);
		  }
		} catch(error){
		  console.log(error);
		}
	  }
	  
	  // This will run any time currentAccount or network are changed
	  useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
		  fetchMints();
		}
	  }, [currentAccount, network]);

	const updateDomain = async () => {
		if (!record || !domain) { return }
		setLoading(true);
		console.log("Updating domain", domain, "with record", record);
		  try {
		  const { ethereum } = window;
		  if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
	  
			let tx = await contract.setRecord(domain, record);
			await tx.wait();
			console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);
			fetchMints();
			setRecord('');
			setDomain('');
		  }
		  } catch(error) {
			console.log(error);
		  }
		setLoading(false);
	  }


	// Render methods
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img src="https://media.giphy.com/media/P9XAzzRQjDgDZunYSb/giphy.gif" alt="Ninja donut gif" />
      {/* Call the connectWallet function we just wrote when the button is clicked */}
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);
	
	const RenderSelectNFT=()=>{

		
		const Nft_selected=(a)=>{
			console.log(a+" called");

			// const { loading, error, nft } = useNFT(
			// 	a, // NFT contract address
			// 	"90473" // token ID
			//   )
			// return nft.image;

			CONTRACT_ADDRESS=a;
			fetchMints();

			for(let i=0;i<arr_nft.length;i++)
			{
				if(arr_nft[i]===a)
				{
					contractAbi=contractABI_arr[i];
					break;
				}
			}

			setnft(true);
		};

		const nft_buttons=()=>{

		return arr_nft.map((val) => {
			return <button className="edit-button" onClick={() =>  Nft_selected(val) }>{val}</button>
		  })

		};
		
		const styles = {
			root: {
			  display:'flex',
			  justifyContent: 'center',
			  width:'100%',
			  padding: '5px'
			}    
		  }

		return(
			<div style={styles.root} className="nftdiv">
				{/* <button>Hello</button> */}
			{nft_buttons()}
			</div>
		)
	};

	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
		  return (
			<div className="mint-container">
			  <p className="subtitle"> Recently minted domains!</p>
			  <div className="mint-list">
				{ mints.map((mint, index) => {
				  return (
					<div className="mint-item" key={index}>
					  <div className='mint-row'>
						<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
						  <p className="underlined">{' '}{mint.name}{tld}{' '}</p>
						</a>
						{/* If mint.owner is currentAccount, add an "edit" button*/}
						{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
						  <button className="edit-button" onClick={() => editRecord(mint.name)}>
							<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
						  </button>
						  :
						  null
						}
					  </div>
				<p> {mint.record} </p>
			  </div>)
			  })}
			</div>
		  </div>);
		}
	  };
	  
	  // This will take us into edit mode and show us the edit buttons!
	  const editRecord = (name) => {
		console.log("Editing record for", name);
		setEditing(true);
		setDomain(name);
	  }

	// Form to enter domain name and data
	const renderInputForm = () =>{
		if (network !== 'Polygon Mumbai Testnet') {
		  return (
			<div className="connect-wallet-container">
			  <p>Please connect to Polygon Mumbai Testnet</p>
			  <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
			</div>
		  );
		}
	
		return (
		  <div className="form-container">
			<div className="first-row">
			  <input
				type="text"
				value={domain}
				placeholder='domain'
				onChange={e => setDomain(e.target.value)}
			  />
			  <p className='tld'> {tld} </p>
			</div>
	
			<input
			  type="text"
			  value={record}
			  placeholder="What's your power?"
			  onChange={e => setRecord(e.target.value)}
			/>
			  {/* If the editing variable is true, return the "Set record" and "Cancel" button */}
			  {editing ? (
				<div className="button-container">
				  {/* This will call the updateDomain function we just made */}
				  <button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
					Set record
				  </button>  
				  {/* This will let us get out of editing mode by setting editing to false */}
				  <button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
					Cancel
				  </button>  
				</div>
			  ) : (
				// If editing is not true, the mint button will be returned instead
				<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
				  Mint
				</button>  
			  )}
		  </div>
		);
	  }
  
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	


	return (
		<div className="App">
			<div className="container">
			<div className="header-container">
  <header>
    <div className="left">
      <p style={{color:'White',fontSize:'34px'}}className="title">🌐Innovate Nest Naming Service🌐</p>
      <p style={{color:'#FFB6C1',fontSize:'22px'}}className="subtitle">    Your Uninterrupted API Empowered by Blockchain!</p>
    </div>
    {/* Display a logo and wallet connection status*/}
    <div className="right">
      <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
      { currentAccount ? <p style={{color:' #ADD8E6',fontSize:'22px'}}> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
    </div>
  </header>
</div>
				
				{!nft && RenderSelectNFT()}
				{nft && !currentAccount && renderNotConnectedContainer()}
				{/* Render the input form if an account is connected */}
				{nft && currentAccount && renderInputForm()}
				{nft && flag && Show_confirmation()}
				{nft && mints && renderMints()}	
				
				<div className="footer-container">
					<a style={{color:'violet',fontSize:'19px'}}href ="https://www.linkedin.com/company/social3club/">Social3 LinkedIn</a>
				</div>
			</div>
		</div>
	);
};

export default App;