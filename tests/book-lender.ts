import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BookLender } from "../target/types/book_lender";
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';

describe("book-lender", () => {
  anchor.AnchorProvider.env();
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BookLender as Program<BookLender>;

  it('Lend one book', async () => {
    const source = new Keypair();
    const destination = new Keypair();
    const isbn = "1234";
    const title = "Smalltalk-80: the language and its implementation";

    await program.methods
        .lendBook(source.publicKey, destination.publicKey, isbn, title)
        .accounts({
          lend: destination.publicKey,
          payer: source.publicKey,
        })
        .signers([destination])
        .rpc();

      const lend = await program.account.lend.fetch(destination.publicKey);

      assert(lend.from.toString() == source.publicKey);
      assert(lend.to.toString() == destination.publicKey);
      assert(lend.isbn == isbn);
      assert(lend.title == title);
  });
});
