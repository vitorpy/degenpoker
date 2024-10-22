#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod degenpoker {
    use super::*;

  pub fn close(_ctx: Context<CloseDegenpoker>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.degenpoker.count = ctx.accounts.degenpoker.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.degenpoker.count = ctx.accounts.degenpoker.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeDegenpoker>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.degenpoker.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeDegenpoker<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Degenpoker::INIT_SPACE,
  payer = payer
  )]
  pub degenpoker: Account<'info, Degenpoker>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseDegenpoker<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub degenpoker: Account<'info, Degenpoker>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub degenpoker: Account<'info, Degenpoker>,
}

#[account]
#[derive(InitSpace)]
pub struct Degenpoker {
  count: u8,
}
