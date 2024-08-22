import * as anchor from "@coral-xyz/anchor";
import { AnchorError, Program } from "@coral-xyz/anchor";
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
    const isbn = "1234567890123";
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

      assert.equal(lend.from.toString(), source.publicKey);
      assert.equal(lend.to.toString(), destination.publicKey);
      assert.equal(lend.isbn, isbn);
      assert.equal(lend.title, title);
  });

  it('Lend one book with invalid ISBN', async () => {
    const source = new Keypair();
    const destination = new Keypair();
    const isbn = "1234";
    const title = "Smalltalk-80: the language and its implementation";

    try {
      await program.methods
          .lendBook(source.publicKey, destination.publicKey, isbn, title)
          .accounts({
            lend: destination.publicKey,
            payer: source.publicKey,
          })
          .signers([destination])
          .rpc();
      assert.ok(false);
    } catch (_err) {
      assert.isTrue(_err instanceof AnchorError);
      const err: AnchorError = _err;
      assert.strictEqual(err.error.errorMessage, "ISBN length must be 13");
      assert.strictEqual(err.error.errorCode.number, 6000);
    }
  });

  it('Lend one book with invalid title', async () => {
    const source = new Keypair();
    const destination = new Keypair();
    const isbn = "1234567890123";
    const title = "";

    try {
      await program.methods
          .lendBook(source.publicKey, destination.publicKey, isbn, title)
          .accounts({
            lend: destination.publicKey,
            payer: source.publicKey,
          })
          .signers([destination])
          .rpc();
      assert.ok(false);
    } catch (_err) {
      assert.isTrue(_err instanceof AnchorError);
      const err: AnchorError = _err;
      assert.strictEqual(err.error.errorMessage, "Title must not be empty");
      assert.strictEqual(err.error.errorCode.number, 6001);
    }
  });
});
