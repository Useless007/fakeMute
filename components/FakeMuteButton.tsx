import "./FakeMuteButton.css";

import { findComponentByCodeLazy } from "@webpack";
import { Popout, Tooltip, useEffect, useRef, useState } from "@webpack/common";

import { getSpoofDeafen, getSpoofMute, toggleDeafen, toggleMute } from "../index";

const HeaderBarIcon = findComponentByCodeLazy(".HEADER_BAR_BADGE_BOTTOM,", 'position:"bottom"');
const SettingsBarButton = findComponentByCodeLazy("tooltipText", "onContextMenu", "children");

// ─── SVG Icons ───

function MicIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                fill="currentColor"
                d="M12 2a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 0 0 7 0v-5A3.5 3.5 0 0 0 12 2Z"
            />
            <path
                fill="currentColor"
                d="M6.5 10a.75.75 0 0 0-1.5 0 7 7 0 0 0 6.25 6.96V20H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-2.25v-3.04A7 7 0 0 0 19 10a.75.75 0 0 0-1.5 0 5.5 5.5 0 0 1-11 0Z"
            />
        </svg>
    );
}

function HeadphoneIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                fill="currentColor"
                d="M12 3a9 9 0 0 0-9 9v1.5a.5.5 0 0 0 .5.5H5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a10 10 0 0 1 20 0v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1.5a.5.5 0 0 0 .5-.5V12a9 9 0 0 0-9-9Z"
            />
        </svg>
    );
}

function FakeMuteIcon({ isActive }: { isActive: boolean; }) {
    return (
        <svg viewBox="0 0 24 24" width={20} height={20}>
            <path
                fill="currentColor"
                d="M12 2a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 0 0 7 0v-5A3.5 3.5 0 0 0 12 2Z"
            />
            <path
                fill="currentColor"
                d="M6.5 10a.75.75 0 0 0-1.5 0 7 7 0 0 0 6.25 6.96V20H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-2.25v-3.04A7 7 0 0 0 19 10a.75.75 0 0 0-1.5 0 5.5 5.5 0 0 1-11 0Z"
            />
            {isActive && (
                <line
                    x1="3" y1="3" x2="21" y2="21"
                    stroke="#ed4245" strokeWidth="2.5" strokeLinecap="round"
                />
            )}
        </svg>
    );
}

// ─── Toggle Switch ───

function ToggleSwitch({ active, onToggle, label }: { active: boolean; onToggle: () => void; label: string; }) {
    return (
        <button
            className={`fakemute-switch${active ? " active" : ""}`}
            onClick={onToggle}
            aria-label={label}
        >
            <span className="fakemute-switch-knob" />
        </button>
    );
}

// ─── Popout Content ───

function FakeMutePopout({ onClose }: { onClose: () => void; }) {
    const [mute, setMute] = useState(getSpoofMute());
    const [deafen, setDeafen] = useState(getSpoofDeafen());

    return (
        <div className="fakemute-popout">
            <div className="fakemute-popout-header">
                <span style={{ fontSize: "14px" }}>🎭</span>
                <span className="fakemute-popout-title">Fake Voice</span>
            </div>
            <div className="fakemute-popout-row">
                <div className="fakemute-popout-info">
                    <div className="fakemute-popout-label">
                        <MicIcon />
                        Fake Mute
                    </div>
                    <div className="fakemute-popout-subtext">Appear muted to others in voice</div>
                </div>
                <ToggleSwitch
                    active={mute}
                    label="Toggle Fake Mute"
                    onToggle={() => {
                        toggleMute();
                        setMute(getSpoofMute());
                    }}
                />
            </div>

            <div className="fakemute-popout-divider" />

            <div className="fakemute-popout-row">
                <div className="fakemute-popout-info">
                    <div className="fakemute-popout-label">
                        <HeadphoneIcon />
                        Fake Deafen
                    </div>
                    <div className="fakemute-popout-subtext">Appear deafened to everyone</div>
                </div>
                <ToggleSwitch
                    active={deafen}
                    label="Toggle Fake Deafen"
                    onToggle={() => {
                        toggleDeafen();
                        setDeafen(getSpoofDeafen());
                    }}
                />
            </div>

            <div className="fakemute-popout-footer">
                <span>By jxyluvcode &amp; useless007</span>
            </div>
        </div>
    );
}

// ─── Main Button Component ───

export function FakeMuteButton({ type }: { type: "top-bar" | "settings-bar"; }) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsActive(getSpoofMute() || getSpoofDeafen());
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const className = isActive ? "fakemute-btn-active" : "";
    const tooltip = isActive ? "FakeMute (Active)" : "FakeMute";

    if (type === "top-bar") {
        return (
            <Popout
                position="bottom"
                align="right"
                animation={Popout.Animation.NONE}
                shouldShow={show}
                onRequestClose={() => setShow(false)}
                targetElementRef={buttonRef}
                renderPopout={() => <FakeMutePopout onClose={() => setShow(false)} />}
            >
                {(_, { isShown }: any) => (
                    <HeaderBarIcon
                        ref={buttonRef}
                        className={`fakemute-btn-top ${className}`}
                        onClick={() => setShow(v => !v)}
                        tooltip={isShown ? null : tooltip}
                        selected={isShown}
                        icon={() => <FakeMuteIcon isActive={isActive} />}
                    />
                )}
            </Popout>
        );
    } else if (type === "settings-bar") {
        return (
            <Popout
                position="top"
                align="center"
                animation={Popout.Animation.NONE}
                shouldShow={show}
                onRequestClose={() => setShow(false)}
                targetElementRef={buttonRef}
                renderPopout={() => <FakeMutePopout onClose={() => setShow(false)} />}
            >
                {(_, { isShown }: any) => (
                    <SettingsBarButton
                        ref={buttonRef}
                        tooltipText={isShown ? null : tooltip}
                        onContextMenu={undefined}
                        onClick={() => setShow(v => !v)}
                        // icon is required by TS for SettingsBarButton but not used when children are provided
                        icon={() => null}
                        className={`fakemute-settings-btn ${className}`}
                    >
                        <HeaderBarIcon
                            className={`fakemute-btn-settings ${className}`}
                            onClick={() => setShow(v => !v)}
                            selected={isShown}
                            icon={() => <FakeMuteIcon isActive={isActive} />}
                        />
                    </SettingsBarButton>
                )}
            </Popout>
        );
    }
    return null;
}
