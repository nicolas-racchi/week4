import { Box } from "@mantine/core";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Greeter from "artifacts/contracts/Greeters.sol/Greeters.json";
import { Contract, providers } from "ethers";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [logs, setLogs] = React.useState("Connect your wallet and greet!");
  const [greetEventLog, setGreetEventLog] = React.useState("");

  async function greet() {
    setLogs("Creating your Semaphore identity...");

    const provider = (await detectEthereumProvider()) as any;

    await provider.request({ method: "eth_requestAccounts" });

    const ethersProvider = new providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();
    const message = await signer.signMessage(
      "Sign this message to create your identity!"
    );

    const greeter = new Contract(
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      Greeter.abi,
      signer
    );

    ethersProvider.pollingInterval = 100;
    greeter.on("NewGreeting", (greeting: any) => {
      setGreetEventLog(greeting);
      console.warn(greeting);
    });

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();
    const identityCommitments = await (
      await fetch("./identityCommitments.json")
    ).json();

    const merkleProof = generateMerkleProof(
      20,
      BigInt(0),
      identityCommitments,
      identityCommitment
    );

    setLogs("Creating your Semaphore proof...");

    const greeting = "Hello world";

    const witness = Semaphore.genWitness(
      identity.getTrapdoor(),
      identity.getNullifier(),
      merkleProof,
      merkleProof.root,
      greeting
    );

    const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      "./semaphore.wasm",
      "./semaphore_final.zkey"
    );
    const solidityProof = Semaphore.packToSolidityProof(proof);

    const response = await fetch("/api/greet", {
      method: "POST",
      body: JSON.stringify({
        greeting,
        nullifierHash: publicSignals.nullifierHash,
        solidityProof: solidityProof,
      }),
    });

    console.log(response);

    if (response.status === 500) {
      const errorMessage = await response.text();

      setLogs(errorMessage);
    } else {
      setLogs("Your anonymous greeting is onchain :)");
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Greetings</title>
        <meta
          name="description"
          content="A simple Next.js/Hardhat privacy application with Semaphore."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Greetings</h1>

        <p className={styles.description}>
          A simple Next.js/Hardhat privacy application with Semaphore.
        </p>

        <div className={styles.logs}>{logs}</div>

        <div onClick={() => greet()} className={styles.button}>
          Greet
        </div>

        <div className={styles.button} style={{ marginTop: "1rem" }}>
          <Link href="/assignment">Go to Assignment</Link>
        </div>

        <Box mt={20}>
          <p>{greetEventLog}</p>
        </Box>
      </main>
    </div>
  );
}
