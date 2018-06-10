import * as Surplus from "surplus";

export function ErrorNotification(props: any) {
    return (
        <div class="notification error">
            <div class="notification-icon error">
                <svg viewBox="0 0 30 30">
                    <g stroke-width="2.9">
                        <polygon class="error-triangle"
                                 points="15,7 26,25 4,25"
                                 stroke-linejoin="round"/>
                        <path d="M15,12V18.5"/>
                        <circle class="excl-pt" stroke="none" cx="15" cy="22" r="2"/>
                    </g>
                </svg>
            </div>
            <div class="notification-description">
                {props.children}
            </div>
        </div>);
}

export function InfoNotification(props: any) {
    return (
        <div class="notification info">
            <div class="notification-icon info">
                <svg viewBox="0 0 30 30">
                    <g stroke-width="2.9">
                        <circle stroke="transparent" cx="15" cy="15" r="9.9"/>
                        <circle class="excl-pt" stroke="none" cx="15" cy="12" r="2"/>
                        <path d="M15,16 V21"/>
                    </g>
                </svg>
            </div>
            <div class="notification-description">
                {props.children}
            </div>
        </div>);
}

export function WarnNotification(props: any) {
    return (
        <div class="notification warn">
            <div class="notification-icon warn">
                <svg viewBox="0 0 30 30">
                    <g stroke-width="2.9">
                        <circle fill="transparent" cx="15" cy="15" r="9.9"/>
                        <path d="M15,8.8 V16"/>
                    </g>
                    <g stroke-width="3">
                        <circle class="excl-pt" stroke="none" cx="15" cy="19.6" r="2"/>
                    </g>
                </svg>
            </div>
            <div class="notification-description">
                {props.children}
            </div>
        </div>);
}