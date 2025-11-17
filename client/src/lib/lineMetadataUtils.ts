// Line metadata utilities removed — provide minimal no-op functions so imports remain safe after rollback
export function generateLineId(_lineText: string, index: number): string {
  return `line-${index}`;
}

export function parseQuillLines(_content: string): Array<{ index: number; text: string; lineId: string }> {
  return [];
}

export function getLineMetadata(_line_metadata: any, _lineId: string): any {
  return null;
}

export function setLineMetadata(_line_metadata: any, _lineId: string, _metadata: any): any {
  return _line_metadata;
}

export function clearLineMetadata(_line_metadata: any, _lineId: string): any {
  return _line_metadata;
}

export function getLinesWithMetadata(_line_metadata: any): string[] {
  return [];
}

export function hasLineMetadata(_line_metadata: any, _lineId: string): boolean {
  return false;
}

export function getLineMetadataSummary(_metadata: any): any {
  return {};
}
