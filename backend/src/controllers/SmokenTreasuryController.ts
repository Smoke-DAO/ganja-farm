import { Request, Response } from 'express';
import { SmokenTreasuryService } from '../models/SmokenTreasuryModel';
const smokenTreasuryService = new SmokenTreasuryService();

export const mintTo = async (req: Request, res: Response) => {
    try {
        const { recipient, amount } = req.body;
        const result = await smokenTreasuryService.mintTo(recipient, amount);
        res.status(200).json({ message: 'Tokens minted successfully', result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const transfer = async (req: Request, res: Response) => {
    try {
        const { sender, recipient, amount } = req.body;
        await smokenTreasuryService.transfer(sender, recipient, amount);
        res.status(200).json({ message: 'Tokens transferred successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const burn = async (req: Request, res: Response) => {
    try {
        const { owner, amount } = req.body;
        await smokenTreasuryService.burn(owner, amount);
        res.status(200).json({ message: 'Tokens burned successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const balanceOf = async (req: Request, res: Response) => {
    try {
        const { owner } = req.params;
        const balance = await smokenTreasuryService.balanceOf(owner);
        res.status(200).json({ balance });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getTotalSupply = (req: Request, res: Response) => {
    const totalSupply = smokenTreasuryService.getTotalSupply();
    res.status(200).json({ totalSupply });
};
