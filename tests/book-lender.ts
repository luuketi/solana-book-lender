import * as anchor from "@coral-xyz/anchor";
import { AnchorError, Program } from "@coral-xyz/anchor";
import { BookLender } from "../target/types/book_lender";
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';

describe("book-lender", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BookLender as Program<BookLender>;

  const source = provider.wallet as anchor.Wallet;
  const destination = new Keypair();

    it("Initialize Shelf", async() => {
      await program.methods
          .initialize()
          .accounts({
            shelf: destination.publicKey,
            payer: source.publicKey,
          })
          .signers([destination])
          .rpc();

      const shelf = await program.account.shelf.fetch(destination.publicKey);
      const lendings = shelf["lendings"];
      assert.lengthOf(lendings, 0);

    });

    it('Lend one book', async () => {
    const isbn = "1234567890123";
    const title = "Smalltalk-80: the language and its implementation";

    await program.methods
        .lendBook(source.publicKey, isbn, title)
        .accounts({
          shelf: destination.publicKey,
        })
        .rpc();

      const shelf = await program.account.shelf.fetch(destination.publicKey);
      const lendings = shelf["lendings"];
      assert.lengthOf(lendings, 1);

      const book = lendings[0];
      assert.equal(book.from.toString(), source.publicKey);
      assert.equal(book.isbn, isbn);
      assert.equal(book.title, title);
  });

  it('Lend one book with invalid ISBN', async () => {
    const isbn = "1234";
    const title = "Smalltalk-80: the language and its implementation";

    try {
      await program.methods
          .lendBook(source.publicKey, isbn, title)
          .accounts({
            shelf: destination.publicKey,
          })
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
    const isbn = "1234567890123";
    const title = "";

    try {
      await program.methods
          .lendBook(source.publicKey, isbn, title)
          .accounts({
            shelf: destination.publicKey,
          })
          .rpc();
      assert.ok(false);
    } catch (_err) {
      assert.isTrue(_err instanceof AnchorError);
      const err: AnchorError = _err;
      assert.strictEqual(err.error.errorMessage, "Title must not be empty");
      assert.strictEqual(err.error.errorCode.number, 6001);
    }
  });

  it('Lend second book', async () => {
    const isbn2 = "9780521644372";
    const title2 = "Kent Beck's Guide to Better Smalltalk: A Sorted Collection";

      await program.methods
          .lendBook(source.publicKey, isbn2, title2)
          .accounts({
            shelf: destination.publicKey,
          })
          .rpc();

    const shelf = await program.account.shelf.fetch(destination.publicKey);
    const lendings = shelf["lendings"];
    assert.lengthOf(lendings, 2);

    const book = lendings[1];
    assert.equal(book.from.toString(), source.publicKey);
    assert.equal(book.isbn, isbn2);
    assert.equal(book.title, title2);
  });
});
