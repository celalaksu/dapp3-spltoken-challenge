import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  findMetadataPda,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";

import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

// async function createTokenWithMetaplex(){
//   // Variables
//   const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
//   const user = await initializeKeypair(connection);
//   const payer = user
//   const mintAuthority = user.publicKey
//   const freezeAuthority = user.publicKey
//   const decimals = 4
//   const owner = user.publicKey

//   // Instructions
//   // Create Token
//   const tokenMint = await token.createMint(
//     connection,
//     payer,
//     mintAuthority,
//     freezeAuthority,
//     decimals
//   );

//    // metaplex setup
//    const metaplex = Metaplex.make(connection)
//    .use(keypairIdentity(user))
//    .use(
//      bundlrStorage({
//        address: "https://devnet.bundlr.network",
//        providerUrl: "https://api.devnet.solana.com",
//        timeout: 60000,
//      })
//    );

//    // file to buffer
//   const buffer = fs.readFileSync("assets/emekcoinV2-logo.png");

//   // buffer to metaplex file
//   const file = toMetaplexFile(buffer, "emekcoinV2-logo.png");

//   // upload image and get image uri
//   const imageUri = await metaplex.storage().upload(file);
//   console.log("image uri:", imageUri);

//   // upload metadata and get metadata uri (off chain metadata)
//   const { uri } = await metaplex.nfts().uploadMetadata({
//     name: "EmekV2",
//     description: "for all workers of the world",
//     image: imageUri,
//   });

//   console.log("metadata uri:", uri);

//   // get metadata account address
//   const metadataPDA = await findMetadataPda(tokenMint);

//   // onchain metadata format
//   const tokenMetadata = {
//     name: "EmekV2",
//     symbol: "EME",
//     uri: uri,
//     sellerFeeBasisPoints: 0,
//     creators: null,
//     collection: null,
//     uses: null,
//   } as DataV2;

//   // transaction to create metadata account
//   const transaction = new web3.Transaction().add(
//     createCreateMetadataAccountV2Instruction(
//       {
//         metadata: metadataPDA,
//         mint: tokenMint,
//         mintAuthority: user.publicKey,
//         payer: user.publicKey,
//         updateAuthority: user.publicKey,
//       },
//       {
//         createMetadataAccountArgsV2: {
//           data: tokenMetadata,
//           isMutable: true,
//         },
//       }
//     )
//   );

//   // Create Token Account
//   const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
//     connection,
//     payer,
//     tokenMint,
//     owner
//   );

//   // Mint Token
//   const mintInfo = await token.getMint(connection, tokenMint);

//   const transactionSignature = await token.mintTo(
//     connection,
//     payer,
//     tokenMint,
//     tokenAccount.address,
//     user,
//     200 * 10 ** mintInfo.decimals
//   );

// }

async function main() {
  // Variables
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  const payer = user;
  const mintAuthority = user.publicKey;
  const freezeAuthority = user.publicKey;
  const decimals = 4;
  const owner = user.publicKey;

  // Instructions
  // Create Token
  const tokenMint = await token.createMint(
    connection,
    user,
    user.publicKey,
    user.publicKey,
    decimals
  );
  console.log("TOKENMINT BİLGİLERİ:");
  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );

  // Create Token Account
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    user.publicKey
  );

  // Mint Token
  const mintInfo = await token.getMint(connection, tokenMint);

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    tokenMint,
    tokenAccount.address,
    user,
    300 * 10 ** mintInfo.decimals
  );
  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
  // end mint token

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // file to buffer
  const buffer = fs.readFileSync("assets/emekcoinV2-logo.png");

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "emekcoinV2-logo.png");

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "EmekV2",
    description: "for all workers of the world",
    image: imageUri,
  });

  console.log("metadata uri:", uri);

  // get metadata account address
  const metadataPDA = await findMetadataPda(tokenMint);
  console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);

  // onchain metadata format
  const tokenMetadata = {
    name: "EmekV2",
    symbol: "EME",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  console.log("=============================");
  console.log("CREATING TRANSACTION");
  console.log("=============================");
  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: tokenMint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  console.log(`METADATA TRANSACTİON : ${transaction}`);
  console.log("=============================");
  console.log("BEGIN SENDANDCONFIRMTRANSACTION");
  // send transaction
  const transactionSignature2 = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=devnet`
  );
  console.log("PublicKey:", user.publicKey.toBase58());
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

//   import { initializeKeypair } from "./initializeKeypair"
// import {
//   Connection,
//   clusterApiUrl,
//   Transaction,
//   sendAndConfirmTransaction,
//   Keypair,
//   SystemProgram,
// } from "@solana/web3.js"
// import {
//   createInitializeMintInstruction,
//   getMinimumBalanceForRentExemptMint,
//   getAssociatedTokenAddress,
//   MINT_SIZE,
//   TOKEN_PROGRAM_ID,
//   createAssociatedTokenAccountInstruction,
//   Account,
//   TokenAccountNotFoundError,
//   TokenInvalidAccountOwnerError,
//   getAccount,
//   createMintToInstruction,
// } from "@solana/spl-token"
// import {
//   Metaplex,
//   keypairIdentity,
//   bundlrStorage,
//   toMetaplexFile,
//   findMetadataPda,
// } from "@metaplex-foundation/js"
// import {
//   DataV2,
//   createCreateMetadataAccountV2Instruction,
// } from "@metaplex-foundation/mpl-token-metadata"
// import * as fs from "fs"

// const tokenName = "Token Name"
// const description = "Description"
// const symbol = "SYMBOL"
// const decimals = 2
// const amount = 1

// async function main() {
//   const connection = new Connection(clusterApiUrl("devnet"))
//   const user = await initializeKeypair(connection)

//   console.log("PublicKey:", user.publicKey.toBase58())

//   // rent for token mint
//   const lamports = await getMinimumBalanceForRentExemptMint(connection)

//   // keypair for new token mint
//   const mintKeypair = Keypair.generate()

//   // get metadata PDA for token mint
//   const metadataPDA = await findMetadataPda(mintKeypair.publicKey)

//   // get associated token account address for use
//   const tokenATA = await getAssociatedTokenAddress(
//     mintKeypair.publicKey,
//     user.publicKey
//   )

//   // metaplex setup
//   const metaplex = Metaplex.make(connection)
//     .use(keypairIdentity(user))
//     .use(
//       bundlrStorage({
//         address: "https://devnet.bundlr.network",
//         providerUrl: "https://api.devnet.solana.com",
//         timeout: 60000,
//       })
//     )

//   // file to buffer
//   const buffer = fs.readFileSync("src/test.png")

//   // buffer to metaplex file
//   const file = toMetaplexFile(buffer, "test.png")

//   // upload image and get image uri
//   const imageUri = await metaplex.storage().upload(file)
//   console.log("image uri:", imageUri)

//   // upload metadata and get metadata uri (off chain metadata)
//   const { uri } = await metaplex
//     .nfts()
//     .uploadMetadata({
//       name: tokenName,
//       description: description,
//       image: imageUri,
//     })
//     .run()

//   console.log("metadata uri:", uri)

//   // onchain metadata format
//   const tokenMetadata = {
//     name: tokenName,
//     symbol: symbol,
//     uri: uri,
//     sellerFeeBasisPoints: 0,
//     creators: null,
//     collection: null,
//     uses: null,
//   } as DataV2

//   // transaction to create metadata account
//   const transaction = new Transaction().add(
//     // create new account
//     SystemProgram.createAccount({
//       fromPubkey: user.publicKey,
//       newAccountPubkey: mintKeypair.publicKey,
//       space: MINT_SIZE,
//       lamports: lamports,
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     // create new token mint
//     createInitializeMintInstruction(
//       mintKeypair.publicKey,
//       decimals,
//       user.publicKey,
//       user.publicKey,
//       TOKEN_PROGRAM_ID
//     ),
//     // create metadata account
//     createCreateMetadataAccountV2Instruction(
//       {
//         metadata: metadataPDA,
//         mint: mintKeypair.publicKey,
//         mintAuthority: user.publicKey,
//         payer: user.publicKey,
//         updateAuthority: user.publicKey,
//       },
//       {
//         createMetadataAccountArgsV2: {
//           data: tokenMetadata,
//           isMutable: true,
//         },
//       }
//     )
//   )

//   // instruction to create ATA
//   const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
//     user.publicKey, // payer
//     tokenATA, // token address
//     user.publicKey, // token owner
//     mintKeypair.publicKey // token mint
//   )

//   let tokenAccount: Account
//   try {
//     // check if token account already exists
//     tokenAccount = await getAccount(
//       connection, // connection
//       tokenATA // token address
//     )
//   } catch (error: unknown) {
//     if (
//       error instanceof TokenAccountNotFoundError ||
//       error instanceof TokenInvalidAccountOwnerError
//     ) {
//       try {
//         // add instruction to create token account if one does not exist
//         transaction.add(createTokenAccountInstruction)
//       } catch (error: unknown) {}
//     } else {
//       throw error
//     }
//   }

//   transaction.add(
//     // mint tokens to token account
//     createMintToInstruction(
//       mintKeypair.publicKey,
//       tokenATA,
//       user.publicKey,
//       amount * Math.pow(10, decimals)
//     )
//   )

//   // send transaction
//   const transactionSignature = await sendAndConfirmTransaction(
//     connection,
//     transaction,
//     [user, mintKeypair]
//   )

//   console.log(
//     `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
//   )
// }

// main()
//   .then(() => {
//     console.log("Finished successfully")
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.log(error)
//     process.exit(1)
//   })
