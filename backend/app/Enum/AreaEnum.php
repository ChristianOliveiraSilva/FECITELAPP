<?php

namespace App\Enum;

use Filament\Support\Contracts\HasLabel;

enum AreaEnum: int implements HasLabel
{
    case TECHNICAL = 1;
    case SCIENTIFIC = 2;

    public function getLabel(): string
    {
        return match ($this) {
            self::TECHNICAL => 'Técnico',
            self::SCIENTIFIC => 'Científico',
        };
    }

    public static function getValues(): array
    {
        return [
            self::TECHNICAL->value => 'Técnico',
            self::SCIENTIFIC->value => 'Científico',
        ];
    }
}
