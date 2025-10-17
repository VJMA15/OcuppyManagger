import { useEffect } from 'react';

// Parse a hotkey string like 'ctrl+d', 'shift+alt+n', 'esc'
function matchHotkey(e, combo) {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop();
  const needCtrl = parts.includes('ctrl');
  const needShift = parts.includes('shift');
  const needAlt = parts.includes('alt');
  const needMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('super');

  const keyMap = {
    esc: 'escape',
    enter: 'enter',
    backspace: 'backspace',
    space: ' ',
  };
  const normalizedKey = keyMap[key] || key;

  return (
    (!!needCtrl === e.ctrlKey) &&
    (!!needShift === e.shiftKey) &&
    (!!needAlt === e.altKey) &&
    (!!needMeta === e.metaKey) &&
    (e.key.toLowerCase() === normalizedKey)
  );
}

// Avoid triggering hotkeys while typing into inputs/textareas/selects
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

export default function useHotkeys(definitions = []) {
  useEffect(() => {
    const handler = (e) => {
      for (const def of definitions) {
        const { combo, handler, allowWhenTyping = false } = def;
        if (!combo || typeof handler !== 'function') continue;
        if (!allowWhenTyping && isTypingTarget(e.target)) continue;
        if (matchHotkey(e, combo)) {
          e.preventDefault();
          try { handler(e); } catch {}
          break; // stop at first match
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [definitions]);
}