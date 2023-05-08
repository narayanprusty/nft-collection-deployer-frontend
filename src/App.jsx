import logo from './logo.svg';
import './App.css';
import MetaMaskSDK from '@metamask/sdk';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import ListGroup from 'react-bootstrap/ListGroup'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from "ethers";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      contractAddress: "0x56A9bCddF533Af1859842074B46B0daD07b7686a",
      abi: [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"collection","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"}],"name":"CollectionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"collection","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"tokenURI","type":"string"}],"name":"TokenMinted","type":"event"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"string","name":"baseURI","type":"string"}],"name":"deployCollection","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract Collection","name":"collection","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      events: []
    };
    this.deployCollection = this.deployCollection.bind(this);
    this.mint = this.mint.bind(this);
  }

  async componentDidMount() {
    const provider = (new MetaMaskSDK()).getProvider()
    const chainId = await provider.request({ method: 'eth_chainId' });
    this.setState({
      chainId: chainId
    })

    provider.on('chainChanged', (chainId) => {
      this.setState({
        chainId: chainId
      })
    });

    

    setInterval(async () => { 
      var requestOptions = {
        method: 'GET',
        redirect: 'follow',
      };
      
      const response = await fetch("http://localhost:4000/events", requestOptions)
      const jsonData = await response.json();

      this.setState({
        events: jsonData
      })

      console.log(jsonData)
    }, 5000)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.chainId == 1337 && 
            <div>
              <b>Deploy Collection</b>
              <hr></hr>
              <Form onSubmit={this.deployCollection}>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Enter collection name" onChange={e => {this.setState({ collectionName: e.target.value });}} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Enter collection symbol" onChange={e => {this.setState({ collectionSymbol: e.target.value });}} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Enter collection token URI" onChange={e => {this.setState({ collectionTokenURI: e.target.value });}} />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Create
                </Button>
                <br></br><br></br>
              </Form>

              <b>Mint NFT</b>
              <hr></hr>
              <Form onSubmit={this.mint}>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Enter collection address" onChange={e => {this.setState({ collectionAddress: e.target.value });}} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Enter recipient address" onChange={e => {this.setState({ nftRecipient: e.target.value });}} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Enter token id" onChange={e => {this.setState({ nftTokenId: e.target.value });}} />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Mint
                </Button>
              </Form>
              <br></br><br></br>

              <b>Events</b>
              <hr></hr>
              <div style={{fontSize: 18}}>
                <ListGroup>
                {this.state.events.map(e => {
                  if(e.eventName == "CollectionCreated")  {
                    return <ListGroup.Item key="">Collection Created with address: {e.collection}, name: {e.name} and symbol: {e.symbol}</ListGroup.Item>
                  } else {
                    return <ListGroup.Item key="">NFT minted for collection: {e.collection}, to: {e.recipient}, token id: {e.tokenId} and token URI: {e.tokenURI}</ListGroup.Item>
                  }
                })}
                </ListGroup>
              </div>
            </div>
          }

          {this.state.chainId != 1337 && 
            <p>
                Incorrect network. <a onClick={this.handleSwitchNetwork} href='#'>Click here</a> to switch to local network
            </p>
          }  
        </header>
      </div>
    );
  }

  async deployCollection(e) {
    e.preventDefault()

    if (
      this.state.collectionName != "" &&
      this.state.collectionSymbol != "" &&
      this.state.collectionTokenURI
    ) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const signer = await provider.getSigner();
        const collectionDeployerContract = new ethers.Contract(this.state.contractAddress, this.state.abi, signer);
        await collectionDeployerContract.deployCollection(
          this.state.collectionName,
          this.state.collectionSymbol,
          this.state.collectionTokenURI
        )
      } catch(e) {
        alert("An error occured")
      }
    }
  }

  async mint(e) {
    e.preventDefault()

    if (
      this.state.collectionAddress != "" &&
      this.state.nftRecipient != "" &&
      this.state.nftTokenId
    ) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const signer = await provider.getSigner();
        const collectionDeployerContract = new ethers.Contract(this.state.contractAddress, this.state.abi, signer);
        await collectionDeployerContract.mint(
          this.state.collectionAddress,
          this.state.nftRecipient,
          this.state.nftTokenId
        )
      } catch(e) {
        alert("An error occured")
      }
    }
  }

  async handleSwitchNetwork(e) {
    const provider = (new MetaMaskSDK()).getProvider()
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
          {
              chainId: "0x539",
              chainName: "localhost",
              rpcUrls: ["http://localhost:8545"],
              nativeCurrency: "ETH",
          },
      ],
    })

    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: "0x539" }],
    })
  }
}

export default App