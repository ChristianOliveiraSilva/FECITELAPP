<?php

namespace App;

use Filament\Tables\Columns\TextColumn;

class Helper
{
    public static function getTooltipFunction()
    {
        return function (TextColumn $column): ?string {
            $state = $column->getState();
    
            $totalLength = 0;

            if (is_array($state)) {
                foreach ($state as $item) {
                    if (is_string($item)) {
                        $totalLength += strlen($item);
                    }
                }
            } elseif (is_string($state)) {
                $totalLength = strlen($state);
            } else {
                $totalLength = 0;
            }

            if ($totalLength <= $column->getCharacterLimit()) {
                return null;
            }
    
            if (is_array($state)) {
                return implode(', ', $state);
            } else {
                return (string) $state;
            }
        };
    }
}
