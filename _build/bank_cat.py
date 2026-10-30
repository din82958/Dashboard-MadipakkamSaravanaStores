# Classifies bank transactions (from bank_txns.json) into business categories and extracts counterparties.
import re
OWN=re.compile(r'DINESH|/\s?S S\s?/|SARAVANA STORES|SARAVANASTORES|50100340884559',re.I)
def norm(s): return re.sub(r'\s+',' ',s).strip()
def party(p,kind):
    """Counterparty name from the particulars text."""
    q=p
    if kind in('upi_in','upi_out'):
        m=re.match(r'^UPI(?:/\s?(?:CR|DR|MOB|IFT)|-REV/\s?MO)?/\s?\d*/?\s*(.*?)/([A-Z]{4})/([^/]*)/',q+'/')
        # layouts: UPI/CR/<ref>/<NAME>/<BANK>/<handle>/<note>
        parts=[x.strip() for x in q.split('/')]
        if len(parts)>=5: return norm(parts[3]),parts[4][:4].upper(),(parts[5] if len(parts)>5 else '')
        if len(parts)>=4: return norm(parts[3]),'',''
        return 'UPI',  '',''
    parts=[x.strip() for x in q.split('/')]
    if q.startswith('NEFT') or q.startswith('RTGS'):
        # NEFT/ <ref>/ NAME/ IFSC...
        return norm(parts[2]) if len(parts)>2 else norm(q),'',''
    if q.startswith('IMPS-OPM') or q.startswith('IMPS- OPM') or q.startswith('IMPS/') or q.startswith('IMPS-MOB'):
        if 'Fund Trf' in q and len(parts)>3: return norm(parts[3]),'',''
        return norm(parts[2]) if len(parts)>2 else norm(q),'',''
    if q.startswith('IFT'):
        return norm(parts[2]) if len(parts)>2 else norm(q),'',''
    if q.startswith('CHQ Paid'):
        return norm(parts[2]) if len(parts)>2 else 'Cheque',  '',''
    return norm(q)[:40],'',''
def classify(x):
    p=x['p'];t=x['t'];u=p.upper()
    if t=='cr':
        if u.startswith('UPI/CR') or u.startswith('UPI/MOB') or u.startswith('UPI/ MO') or u.startswith('UPI/IFT') or u.startswith('UPI-REV'):
            return ('upi_in' if not u.startswith('UPI-REV') else 'reversal_in')
        if u.startswith('CMS_IFT'): return 'card_in'
        if u.startswith('ATM/CASH') or u.startswith('RECYCLER') or 'CASH DEP' in u or u.startswith('CDM'): return 'cash_in'
        if u.startswith('BB/CHQ') or u.startswith('CHQ DEP'): return 'chq_in'
        if u.startswith('CHQ ISSUED BOUNCE') or u.startswith('NEFT RETURN') or 'RETURN' in u[:14]: return 'reversal_in'
        if OWN.search(p): return 'owner_in'
        return 'other_in'
    if u.startswith('UPI/DR') or u.startswith('UPI/MOB') or u.startswith('UPI/ MO') or u.startswith('UPI/ DR'):
        return 'own_out' if OWN.search(p) else 'upi_out'
    if u.startswith('CGST') or u.startswith('SGST') or u.startswith('POS MID') or u.startswith('CHARGE') or u.startswith('POS-VISA') or 'FEE' in u[:40] : return 'fees'
    if u.startswith('NACH'): return 'subs'
    if u.startswith('CHQ ISSUED BOUNCE') or u.startswith('CHQ DEPOSIT BOUNCE'): return 'bounce_out'
    if u.startswith('COURT') : return 'legal'
    if u.startswith('NEFT') or u.startswith('RTGS') or u.startswith('IMPS') or u.startswith('IFT') or u.startswith('CHQ PAID') or u.startswith('TRANSFER TO DEPOSIT'):
        return 'own_out' if OWN.search(p) else 'supplier_out'
    return 'other_out'
